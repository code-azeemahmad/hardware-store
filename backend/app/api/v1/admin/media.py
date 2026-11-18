import os
import re
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import AdminRole, AdminUser

router = APIRouter(prefix="/media", tags=["admin-media"])

# Strict raster image whitelist: SVG is rejected to eliminate Stored XSS / XXE attack vectors.
ALLOWED_MIME_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


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
    """Upload an image asset to persistent media storage (/data/media)."""
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

    # 5. Generate clean, collision-free filename
    clean_stem = re.sub(r"[^a-zA-Z0-9_-]", "-", Path(original_filename).stem)[:40]
    unique_suffix = uuid.uuid4().hex[:10]
    filename = f"{clean_stem}_{unique_suffix}{ext}"

    # 5. Save to media storage path
    storage_dir = Path(settings.MEDIA_STORAGE_PATH)
    storage_dir.mkdir(parents=True, exist_ok=True)
    destination = storage_dir / filename

    with open(destination, "wb") as f:
        f.write(content)

    return MediaUploadResponse(
        url=f"/media/{filename}",
        filename=filename,
        size_bytes=size_bytes,
        content_type=content_type,
    )
