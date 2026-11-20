import io
import os
import pytest
from PIL import Image
from starlette.testclient import TestClient
from app.api.v1.admin.media import cleanup_unreferenced_media_file
from app.core.config import settings
from app.models.product import Brand, Product, ProductImage


def _create_test_image(format: str, size=(100, 100), color=(255, 0, 0)) -> bytes:
    buf = io.BytesIO()
    img = Image.new("RGB", size, color)
    img.save(buf, format=format)
    return buf.getvalue()


def test_upload_media_unauthorized(client: TestClient):
    valid_png = _create_test_image("PNG")
    res = client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("test.png", valid_png, "image/png")},
    )
    assert res.status_code == 401


def test_upload_valid_png_converts_to_webp(super_admin_client: TestClient):
    valid_png = _create_test_image("PNG", size=(200, 200))
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("sample_hinge.png", valid_png, "image/png")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["url"].startswith("/media/")
    assert data["filename"].endswith(".webp")
    assert "sample_hinge" in data["filename"]
    assert data["content_type"] == "image/webp"
    assert data["size_bytes"] > 0


def test_upload_valid_jpeg_converts_to_webp(super_admin_client: TestClient):
    valid_jpeg = _create_test_image("JPEG", size=(300, 200))
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("plywood_sheet.jpg", valid_jpeg, "image/jpeg")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["filename"].endswith(".webp")
    assert data["content_type"] == "image/webp"


def test_upload_valid_webp(super_admin_client: TestClient):
    valid_webp = _create_test_image("WEBP", size=(150, 150))
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("smart_lock.webp", valid_webp, "image/webp")},
    )
    assert res.status_code == 201
    assert res.json()["filename"].endswith(".webp")


def test_upload_dimension_clamping(super_admin_client: TestClient):
    # Upload oversized 2000x1200 image -> clamped to max 1600x1600 preserving aspect ratio
    large_img = _create_test_image("JPEG", size=(2000, 1200))
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("oversized_fixture.jpg", large_img, "image/jpeg")},
    )
    assert res.status_code == 201
    filename = res.json()["filename"]
    saved_path = os.path.join(settings.MEDIA_STORAGE_PATH, filename)
    with Image.open(saved_path) as saved_img:
        assert saved_img.width <= 1600
        assert saved_img.height <= 1600
        assert saved_img.width == 1600
        assert saved_img.height == 960  # Aspect ratio 2000:1200 = 1600:960


def test_upload_exif_stripped_and_orientation_applied(super_admin_client: TestClient):
    # Image with orientation 6 (90 deg CW) and sensitive metadata
    buf = io.BytesIO()
    img = Image.new("RGB", (200, 100), color=(0, 255, 0))
    exif = img.getexif()
    exif[0x0112] = 6  # Orientation
    exif[0x010F] = "NikonSecretGPS"  # Make
    img.save(buf, format="JPEG", exif=exif)
    payload = buf.getvalue()

    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("exif_sample.jpg", payload, "image/jpeg")},
    )
    assert res.status_code == 201
    filename = res.json()["filename"]
    saved_path = os.path.join(settings.MEDIA_STORAGE_PATH, filename)
    with Image.open(saved_path) as saved_img:
        # Exif transpose rotated 200x100 with orientation 6 into 100x200
        assert saved_img.width == 100
        assert saved_img.height == 200
        # EXIF metadata (camera/GPS) must be completely stripped
        saved_exif = saved_img.getexif()
        assert 0x010F not in saved_exif
        assert 0x0112 not in saved_exif or saved_exif.get(0x0112) == 1


def test_upload_malformed_truncated_image(super_admin_client: TestClient):
    # Truncated header claiming to be PNG
    fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("corrupted.png", fake_png, "image/png")},
    )
    assert res.status_code == 400
    assert "invalid or corrupted image content" in res.json()["detail"].lower()


def test_upload_decompression_bomb_rejected(super_admin_client: TestClient, monkeypatch):
    # Temporarily lower MAX_IMAGE_PIXELS to test decompression bomb rejection
    monkeypatch.setattr(Image, "MAX_IMAGE_PIXELS", 5000)
    bomb_image = _create_test_image("PNG", size=(100, 100))  # 10,000 pixels > 5,000 limit
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("pixel_bomb.png", bomb_image, "image/png")},
    )
    assert res.status_code == 400
    assert "decompression" in res.json()["detail"].lower() or "megapixels" in res.json()["detail"].lower()


def test_upload_svg_rejected_for_security(super_admin_client: TestClient):
    # SVG files are rejected to prevent Stored XSS / XXE
    svg_payload = b"<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("xss_vector.svg", svg_payload, "image/svg+xml")},
    )
    assert res.status_code == 400
    assert "unsupported file extension" in res.json()["detail"].lower()


def test_upload_spoofed_extension_magic_bytes_check(super_admin_client: TestClient):
    # Malicious script masquerading as PNG with spoofed MIME header
    fake_script = b"<?php phpinfo(); ?>malicious script"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("backdoor.png", fake_script, "image/png")},
    )
    assert res.status_code == 400
    assert "magic bytes" in res.json()["detail"].lower()


def test_upload_invalid_extension(super_admin_client: TestClient):
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("malicious.exe", b"binarydata", "image/png")},
    )
    assert res.status_code == 400
    assert "unsupported file extension" in res.json()["detail"].lower()


def test_upload_invalid_mime_type(super_admin_client: TestClient):
    valid_png = _create_test_image("PNG")
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("document.png", valid_png, "application/pdf")},
    )
    assert res.status_code == 400
    assert "unsupported or mismatched content type" in res.json()["detail"].lower()


def test_upload_empty_file(super_admin_client: TestClient):
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert res.status_code == 400
    assert "empty file" in res.json()["detail"].lower()


def test_upload_oversized_file(super_admin_client: TestClient):
    # 10MB + 1KB
    large_payload = b"x" * (10 * 1024 * 1024 + 1024)
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("large.png", large_payload, "image/png")},
    )
    assert res.status_code == 413
    assert "exceeds maximum allowed size" in res.json()["detail"].lower()


def test_cleanup_unreferenced_media_file_path_traversal(db_session):
    # Path traversal attack must be rejected
    traversal_url = "/media/../../etc/passwd"
    cleaned = cleanup_unreferenced_media_file(traversal_url, db_session)
    assert cleaned is False


def test_cleanup_unreferenced_media_file_shared_reference(db_session):
    # Create test physical file
    test_filename = "shared_test_cleanup_image.webp"
    file_path = os.path.join(settings.MEDIA_STORAGE_PATH, test_filename)
    os.makedirs(settings.MEDIA_STORAGE_PATH, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(b"RIFF\x10\x00\x00\x00WEBPVP8 ...")

    target_url = f"/media/{test_filename}"

    # 1. Product exists and references the image
    p = Product(
        slug="test-cleanup-product-1",
        sku="SKU-CLEANUP-1",
        name_en="Test Cleanup 1",
        name_ur="ٹیسٹ 1",
        price_on_request=True,
    )
    db_session.add(p)
    db_session.flush()

    img1 = ProductImage(product_id=p.id, image_url=target_url)
    db_session.add(img1)
    db_session.commit()

    # Attempt cleanup while reference exists: must NOT delete file
    cleaned = cleanup_unreferenced_media_file(target_url, db_session)
    assert cleaned is False
    assert os.path.isfile(file_path)

    # 2. Delete database reference
    db_session.delete(img1)
    db_session.commit()

    # Now cleanup should delete physical file
    cleaned = cleanup_unreferenced_media_file(target_url, db_session)
    assert cleaned is True
    assert not os.path.isfile(file_path)


def test_cleanup_unreferenced_media_file_brand_reference(db_session):
    test_filename = "brand_logo_cleanup_test.webp"
    file_path = os.path.join(settings.MEDIA_STORAGE_PATH, test_filename)
    os.makedirs(settings.MEDIA_STORAGE_PATH, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(b"RIFF\x10\x00\x00\x00WEBPVP8 ...")

    target_url = f"/media/{test_filename}"

    brand = Brand(
        slug="test-cleanup-brand",
        name="Test Cleanup Brand",
        logo_url=target_url,
    )
    db_session.add(brand)
    db_session.commit()

    # File referenced by brand -> cleanup must NOT delete
    cleaned = cleanup_unreferenced_media_file(target_url, db_session)
    assert cleaned is False
    assert os.path.isfile(file_path)

    # Disassociate brand logo
    brand.logo_url = None
    db_session.commit()

    # Now cleanup deletes the physical file
    cleaned = cleanup_unreferenced_media_file(target_url, db_session)
    assert cleaned is True
    assert not os.path.isfile(file_path)


def test_cleanup_unreferenced_media_file_oserror_safe(db_session, monkeypatch):
    test_filename = "oserror_safe_test.webp"
    file_path = os.path.join(settings.MEDIA_STORAGE_PATH, test_filename)
    os.makedirs(settings.MEDIA_STORAGE_PATH, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(b"RIFF\x10\x00\x00\x00WEBPVP8 ...")

    target_url = f"/media/{test_filename}"

    def mock_unlink(self):
        raise OSError("Simulated filesystem I/O error or permission denied")

    # When filesystem unlinking raises OSError, cleanup_unreferenced_media_file must catch it,
    # log a warning, and safely return False rather than crashing the API or transaction.
    monkeypatch.setattr("pathlib.Path.unlink", mock_unlink)

    cleaned = cleanup_unreferenced_media_file(target_url, db_session)
    assert cleaned is False
    # File remains safely on disk (recoverable orphan rather than silent crash)
    assert os.path.isfile(file_path)
    os.remove(file_path)

