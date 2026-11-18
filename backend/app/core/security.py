import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
from jose import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings

# Initialize password hasher: Argon2id per security specification
password_hash = PasswordHash((Argon2Hasher(),))
ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def hash_token(token: str) -> str:
    """Generate SHA-256 hash of a token for secure database indexing."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> tuple[str, str, datetime]:
    """Create a cryptographically unique refresh token with a JTI and return (token, hash, expires_at)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    jti = secrets.token_hex(16)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh", "jti": jti}
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    token_hash = hash_token(token)
    return token, token_hash, expire


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify token is an access token."""
    payload = decode_token(token)
    if payload and payload.get("type", "access") == "access":
        return payload
    return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and verify token is a refresh token."""
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None


def generate_invitation_token() -> str:
    """Generate a high-entropy URL-safe token for staff invitation links."""
    return secrets.token_urlsafe(32)


def hash_invitation_token(token: str) -> str:
    """Compute SHA-256 hash of token to store in database securely."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
