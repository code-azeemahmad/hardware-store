import io
import pytest
from starlette.testclient import TestClient


def test_upload_media_unauthorized(client: TestClient):
    res = client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("test.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01", "image/png")},
    )
    assert res.status_code == 401


def test_upload_valid_png(super_admin_client: TestClient):
    fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("sample_hinge.png", fake_png, "image/png")},
    )
    assert res.status_code == 201
    data = res.json()
    assert data["url"].startswith("/media/")
    assert data["filename"].endswith(".png")
    assert "sample_hinge" in data["filename"]
    assert data["content_type"] == "image/png"
    assert data["size_bytes"] == len(fake_png)


def test_upload_valid_jpeg(super_admin_client: TestClient):
    fake_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("plywood_sheet.jpg", fake_jpeg, "image/jpeg")},
    )
    assert res.status_code == 201
    assert res.json()["filename"].endswith(".jpg")


def test_upload_valid_webp(super_admin_client: TestClient):
    fake_webp = b"RIFF\x1a\x00\x00\x00WEBPVP8 \x0e\x00\x00\x00/sampledata"
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("smart_lock.webp", fake_webp, "image/webp")},
    )
    assert res.status_code == 201
    assert res.json()["filename"].endswith(".webp")


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
    res = super_admin_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("document.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01", "application/pdf")},
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
