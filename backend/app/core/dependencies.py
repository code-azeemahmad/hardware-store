import uuid
from typing import Callable, Sequence
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import AdminRole, AdminUser

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=True,
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(AdminUser).filter(AdminUser.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: AdminUser = Depends(get_current_user),
) -> AdminUser:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )
    return current_user


def require_roles(allowed_roles: Sequence[AdminRole]) -> Callable[[AdminUser], AdminUser]:
    """Dependency factory that enforces Role-Based Access Control (RBAC)."""

    def role_checker(
        current_user: AdminUser = Depends(get_current_active_user),
    ) -> AdminUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required role: {[r.value for r in allowed_roles]}",
            )
        return current_user

    return role_checker
