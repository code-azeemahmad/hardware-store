# Media System Audit & Implementation Specification

**Project:** Naseer Plywood & Hardware  
**Document Status:** Final Specification & Audit (Approved with Pre-Implementation Corrections)  
**Target Environment:** Local Docker & Production AWS EC2  

---

## 1. Architectural Directives & Boundaries

Per confirmed project requirements:
- The persistent named volume `hardware_media_data` mounted at `/data/media` is the **sole** media storage layer.
- The `product_images` database table is reused without duplicate image columns or schema migrations.
- The `/media/` Nginx location is the sole public ingress for uploaded media assets.
- No secondary media volumes, external S3 storage abstractions, or duplicate upload endpoints are authorized.
- Uploads must be verified, sanitized, auto-oriented, compressed to modern WebP, and served securely with zero Stored XSS or MIME-sniffing risks.

---

## 2. Media Upload & Processing Specification

### 2.1 Safe Upload Verification & Decompression Bomb Protection
In `backend/app/api/v1/admin/media.py`:
- **File Size Limit:** Retain the existing 10 MB upload limit (`MAX_FILE_SIZE = 10 * 1024 * 1024`). This accommodates raw high-resolution photography taken by showroom staff while preventing denial-of-service memory exhaustion.
- **Decompression Bomb Protection:**
  ```python
  from PIL import Image, ImageOps, UnidentifiedImageError
  # Enforce maximum pixel ceiling (25 Megapixels, ~5000x5000)
  Image.MAX_IMAGE_PIXELS = 25_000_000
  ```
  If an uploaded file exceeds this threshold, Pillow raises `Image.DecompressionBombError`, which is caught and returned as `400 Bad Request` ("Image exceeds maximum allowable pixel dimensions of 25 megapixels").
- **Magic Byte & Whitelist Verification:** Validate file signatures before passing bytes to Pillow:
  - JPEG: `\xff\xd8\xff`
  - PNG: `\x89PNG\r\n\x1a\n`
  - WebP: `RIFF....WEBP`
  - SVGs are **strictly rejected** (`400 Bad Request`) to eliminate Stored XSS and XML External Entity (XXE) vectors.
- **Safe Image Decoding:** Wrap decoding in a `try...except (UnidentifiedImageError, OSError)` block to catch malformed, truncated, or obfuscated payloads, returning a descriptive `400 Bad Request`.

### 2.2 EXIF Auto-Orientation & Metadata Stripping
Smartphone photos taken in showrooms contain EXIF orientation tags (values 1–8) that cause photos to render sideways or inverted in browsers if stripped naively.
- **Auto-Orientation:** Apply `ImageOps.exif_transpose(image)` *before* metadata removal. This physically transforms pixel buffers so the image is oriented correctly regardless of viewing client.
- **Privacy & Security (EXIF Stripping):** By constructing a clean Image buffer and saving directly to WebP without passing an `exif` dictionary, all device serials, camera metadata, and GPS location coordinates are permanently eliminated.

### 2.3 Dimension Clamping & WebP Compression
- **Maximum Dimensions:** Clamp images to a maximum bounding box of **1600 × 1600 pixels** while strictly preserving the original aspect ratio:
  ```python
  if image.width > 1600 or image.height > 1600:
      image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
  ```
- **Color Mode Normalization:**
  - If `image.mode in ("RGBA", "LA")` or transparency is present, retain RGBA mode.
  - If `image.mode == "CMYK"`, convert to RGB (`image.convert("RGB")`).
  - Otherwise convert to RGB (`image.convert("RGB")`).
- **WebP Optimization Settings:**
  - Format: `WEBP`
  - Quality: `82` (provides visually lossless fidelity for hardware engravings and woodgrain textures).
  - Method: `6` (maximum compression search effort).
- **Compression Target:** File size varies based on image complexity and visual entropy (e.g. detailed marble laminates vs. solid brass fixtures). Rather than imposing an arbitrary hard ceiling below 300 KB, the goal is a **representative 50% to 85% file size reduction** compared to the uncompressed raw upload, yielding files typically between 100 KB and 450 KB.

### 2.4 Filename Generation & Path Containment
- **Sanitized Naming:**
  ```python
  clean_stem = re.sub(r"[^a-zA-Z0-9_-]", "-", Path(original_filename).stem)[:40]
  unique_suffix = uuid.uuid4().hex[:10]
  filename = f"{clean_stem}_{unique_suffix}.webp"
  ```
- **Storage Target:** Write to `Path(settings.MEDIA_STORAGE_PATH) / filename` (inside `/data/media`).
- **Contract Preservation:** Continues returning the exact existing `MediaUploadResponse` schema:
  ```json
  {
    "url": "/media/door-handle-brass_a1b2c3d4e5.webp",
    "filename": "door-handle-brass_a1b2c3d4e5.webp",
    "size_bytes": 184520,
    "content_type": "image/webp"
  }
  ```

---

## 3. Physical File Cleanup Specification

### 3.1 The Orphaned File Problem
When a product image is removed via `DELETE /api/v1/admin/products/{product_id}/images/{image_id}` or when a product is deleted (cascade delete of `ProductImage`), the database row is removed, but the physical file remains in `/data/media` indefinitely.

### 3.2 Safe Reference-Counted Cleanup Algorithm
To prevent storage leaks without breaking shared assets or introducing race conditions:

```python
def cleanup_unreferenced_media_file(target_url: str, db: Session) -> None:
    """Safely unlink media file if no other database entity references it."""
    # 1. Path containment check: ensure URL points to /media/
    if not target_url.startswith("/media/"):
        return

    storage_root = Path(settings.MEDIA_STORAGE_PATH).resolve()
    filename = Path(target_url).name
    candidate_path = (storage_root / filename).resolve()

    # Enforce strict path traversal protection
    if not candidate_path.is_relative_to(storage_root):
        logger.warning(f"Path traversal rejected in media cleanup: {target_url}")
        return

    # 2. Check all relevant database references
    other_img_refs = (
        db.query(ProductImage)
        .filter(ProductImage.image_url == target_url)
        .count()
    )
    brand_refs = (
        db.query(Brand)
        .filter(Brand.logo_url == target_url)
        .count()
    )

    # 3. Unlink physical file only when zero database references remain
    if other_img_refs == 0 and brand_refs == 0:
        if candidate_path.is_file():
            try:
                candidate_path.unlink()
                logger.info(f"Cleaned unreferenced media file: {candidate_path.name}")
            except OSError as e:
                # Log warning; do NOT fail the request or roll back DB transaction
                logger.warning(f"Failed to unlink media file {candidate_path}: {e}")
```

### 3.3 Transaction & Concurrency Guarantees
1. **Commit Order:** The database deletion (`db.delete(img)`, `db.commit()`) **must** complete and commit *before* invoking `cleanup_unreferenced_media_file`.
2. **Filesystem Resilience:** If `unlink()` encounters an OS permission or lock error, the error is caught and logged. The API call succeeds because the database row was already committed.
3. **Concurrency Mitigation:** In an environment where an admin attaches an existing image to Product B while another admin deletes it from Product A:
   - Because `db.commit()` runs before the reference check, if Product B attached and committed first, the reference count will be ≥ 1, safely preserving the file.
   - For high-concurrency environments, a periodic background garbage collection job can reconcile unreferenced files older than 24 hours to eliminate race windows.

---

## 4. Nginx Media Configuration & Hardening

### 4.1 Header Shadowing Fix
In Nginx, declaring `add_header` in a child `location` block disables inheritance of all `add_header` directives from the parent `server` block.

Both `frontend/nginx.conf` and `frontend/nginx.prod.conf` must specify explicit security headers directly inside `location /media/`:

```nginx
location ^~ /media/ {
    alias /data/media/;
    expires 30d;
    add_header Cache-Control "public, no-transform";
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Access-Control-Allow-Origin "*" always;
    try_files $uri =404;
}
```
*Note: The `^~` modifier gives the prefix location priority over regular expression matches (`location ~* \.(?:...|webp)$`), preventing requests for `/media/*.webp` from falling into the static frontend asset directory.*

### 4.2 Comprehensive Test Procedures
1. **Valid Image Optimization Test:**
   - Upload a representative 5 MB JPEG photo (4000×3000).
   - Verify: `HTTP 201 Created`, `content_type == "image/webp"`, width and height ≤ 1600px, 50–85% file size reduction, EXIF metadata stripped.
2. **Decompression Bomb Protection Test:**
   - Attempt to upload an image constructed to unpack to > 25 megapixels (e.g. 10000×10000).
   - Verify: `HTTP 400 Bad Request` with `Image exceeds maximum allowable pixel dimensions`.
3. **Malformed Payload Test:**
   - Upload a file with a `.jpg` extension containing random binary noise or truncated bytes.
   - Verify: `HTTP 400 Bad Request` with `Invalid or corrupted image content`.
4. **MIME & Header Verification:**
   - Request `curl -sI http://localhost/media/sample_test.webp`.
   - Verify: `HTTP 200 OK`, `Content-Type: image/webp`, `X-Content-Type-Options: nosniff`, `Cache-Control: public, no-transform`.
5. **Path Traversal Rejection Test:**
   - Request `curl -sI "http://localhost/media/../../etc/passwd"`.
   - Verify: `400 Bad Request` or `404 Not Found`.
