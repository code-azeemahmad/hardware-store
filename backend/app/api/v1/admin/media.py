import io
import logging
import os
import re
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.config import settings
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import AdminRole, AdminUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/media", tags=["admin-media"])

# Strict raster image whitelist: SVG is rejected to eliminate Stored XSS / XXE attack vectors.
ALLOWED_MIME_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Decompression bomb defense: max 25 Megapixels (~5000x5000)
Image.MAX_IMAGE_PIXELS = 25_000_000


def _validate_image_magic_bytes(content: bytes, ext: str) -> bool:
    """Validate image magic bytes (file signature) to ensure content matches extension."""
    if len(content) < 12:
        return False

    if ext in {".jpg", ".jpeg"}:
        return content.startswith(b"\xff\xd8\xff")
    elif ext == ".png":
        return content.startswith(b"\x89PNG\r\n\x1a\n")
    elif ext == ".webp":
        return content.startswith(b"RIFF") and content[8:12] == b"WEBP"
    return False


class MediaUploadResponse(BaseModel):
    url: str
    filename: str
    size_bytes: int
    content_type: str


@router.post("/upload", response_model=MediaUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile,
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Upload an image asset, optimize with Pillow, convert to WebP, and store in /data/media."""
    # 1. Validate file extension
    original_filename = file.filename or "upload"
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {list(ALLOWED_EXTENSIONS)}",
        )

    # 2. Validate MIME type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES or ext not in ALLOWED_MIME_TYPES[content_type]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported or mismatched content type '{content_type}' for extension '{ext}'. SVG and executable formats are strictly forbidden.",
        )

    # 3. Read content and validate size
    content = await file.read()
    size_bytes = len(content)
    if size_bytes > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 10MB ({size_bytes} bytes uploaded)",
        )
    if size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload an empty file",
        )

    # 4. Validate authentic magic bytes (deep file content inspection)
    if not _validate_image_magic_bytes(content, ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image content: file signature (magic bytes) does not match an authentic JPEG, PNG, or WebP image.",
        )

    # 5. Safe Pillow decoding with decompression bomb protection
    try:
        img = Image.open(io.BytesIO(content))
        if img.width * img.height > Image.MAX_IMAGE_PIXELS:
            raise Image.DecompressionBombError(
                f"Image size ({img.width * img.height} pixels) exceeds limit of {Image.MAX_IMAGE_PIXELS} pixels"
            )
        img.load()  # Force decode all pixel data to identify truncated or corrupted streams
    except Image.DecompressionBombError as e:
        logger.warning(f"Decompression bomb blocked: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image exceeds maximum allowable pixel dimensions (25 megapixels). Upload rejected for security.",
        )
    except (UnidentifiedImageError, OSError, ValueError) as e:
        logger.warning(f"Corrupted or malformed image rejected: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or corrupted image content. Unable to decode image.",
        )

    # 6. Auto-orient image based on EXIF tag (corrects mobile photos)
    img = ImageOps.exif_transpose(img)

    # 7. Dimension clamping: max 1600x1600 preserving aspect ratio
    if img.width > 1600 or img.height > 1600:
        img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)

    # 8. Normalize color mode for WebP conversion
    if img.mode in ("RGBA", "LA"):
        save_mode = "RGBA"
    elif img.mode == "CMYK":
        img = img.convert("RGB")
        save_mode = "RGB"
    else:
        img = img.convert("RGB")
        save_mode = "RGB"

    # 9. Strip EXIF metadata and compress to optimized WebP
    out_io = io.BytesIO()
    # Omitting 'exif' parameter strips all camera, device, and GPS metadata
    img.save(out_io, format="WEBP", quality=82, method=6)
    webp_bytes = out_io.getvalue()

    # 10. Generate clean, collision-free filename
    clean_stem = re.sub(r"[^a-zA-Z0-9_-]", "-", Path(original_filename).stem)[:40]
    unique_suffix = uuid.uuid4().hex[:10]
    filename = f"{clean_stem}_{unique_suffix}.webp"

    # 11. Save to persistent media storage path (/data/media)
    storage_dir = Path(settings.MEDIA_STORAGE_PATH)
    storage_dir.mkdir(parents=True, exist_ok=True)
    destination = storage_dir / filename

    with open(destination, "wb") as f:
        f.write(webp_bytes)

    logger.info(
        f"Optimized image '{original_filename}' ({size_bytes} bytes) -> '{filename}' ({len(webp_bytes)} bytes WebP)"
    )

    return MediaUploadResponse(
        url=f"/media/{filename}",
        filename=filename,
        size_bytes=len(webp_bytes),
        content_type="image/webp",
    )


def cleanup_unreferenced_media_file(target_url: str, db: Session) -> bool:
    """Safely unlink a physical media file if no other database entity references it.
    
    Guarantees:
    - Path containment: restricts deletion strictly within MEDIA_STORAGE_PATH.
    - Reference checks: verifies no remaining references in product_images or brands.
    - Safe error handling: catches OSError and logs warnings without aborting or rolling back DB transactions.
    - If cleanup fails or is ambiguous, retains a recoverable orphan rather than damaging a valid reference.
    """
    if not target_url or not target_url.startswith("/media/"):
        return False

    try:
        storage_root = Path(settings.MEDIA_STORAGE_PATH).resolve()
        filename = Path(target_url).name
        candidate_path = (storage_root / filename).resolve()

        # Enforce strict path traversal protection
        if not candidate_path.is_relative_to(storage_root):
            logger.warning(f"Path traversal rejected in media cleanup: {target_url}")
            return False

        # Check all relevant database references
        from app.models.product import Brand, ProductImage

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

        if other_img_refs == 0 and brand_refs == 0:
            if candidate_path.is_file():
                try:
                    candidate_path.unlink()
                    logger.info(f"Cleaned unreferenced media file: {candidate_path.name}")
                    return True
                except OSError as e:
                    # Log warning; retain orphan rather than crashing or damaging references
                    logger.warning(f"Could not unlink media file {candidate_path}: {e}")
                    return False
    except Exception as e:
        logger.warning(f"Error checking media file cleanup for {target_url}: {e}")
        return False
    return False
