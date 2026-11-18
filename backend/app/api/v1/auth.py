import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.user import AdminRefreshToken, AdminUser
from app.schemas.user import (
    PasswordChangeRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserLogin,
    UserRead,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive",
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)

    access_token = create_access_token(subject=str(user.id))
    refresh_token, ref_hash, ref_exp = create_refresh_token(subject=str(user.id))

    # Persist active refresh token in database for server-side revocation tracking
    db_token = AdminRefreshToken(
        token_hash=ref_hash,
        user_id=user.id,
        expires_at=ref_exp,
        is_revoked=False,
    )
    db.add(db_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_data = decode_refresh_token(payload.refresh_token)
    if not token_data or "sub" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    raw_hash = hash_token(payload.refresh_token)
    stored_token = (
        db.query(AdminRefreshToken)
        .filter(AdminRefreshToken.token_hash == raw_hash)
        .first()
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not recognized",
        )

    # Reuse detection: if an already-revoked refresh token is presented, suspect token theft
    if stored_token.is_revoked:
        # Revoke all active tokens for this user as a safeguard against compromised session
        db.query(AdminRefreshToken).filter(
            AdminRefreshToken.user_id == stored_token.user_id,
            AdminRefreshToken.is_revoked.is_(False),
        ).update({"is_revoked": True})
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked. All active sessions invalidated.",
        )

    # Check expiration against database record
    exp = stored_token.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        stored_token.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    user = db.query(AdminUser).filter(AdminUser.id == stored_token.user_id).first()
    if not user or not user.is_active:
        stored_token.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or account is inactive",
        )

    # Rotate refresh token: invalidate current token and issue new pair
    new_access_token = create_access_token(subject=str(user.id))
    new_refresh_token, new_ref_hash, new_ref_exp = create_refresh_token(subject=str(user.id))

    stored_token.is_revoked = True
    stored_token.replaced_by_hash = new_ref_hash

    new_db_token = AdminRefreshToken(
        token_hash=new_ref_hash,
        user_id=user.id,
        expires_at=new_ref_exp,
        is_revoked=False,
    )
    db.add(new_db_token)
    db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserRead)
def get_me(current_user: AdminUser = Depends(get_current_active_user)):
    return current_user


@router.post("/change-password")
def change_password(
    data: PasswordChangeRequest,
    current_user: AdminUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    # Invalidate all active refresh tokens on password change
    db.query(AdminRefreshToken).filter(
        AdminRefreshToken.user_id == current_user.id,
        AdminRefreshToken.is_revoked.is_(False),
    ).update({"is_revoked": True})
    db.commit()
    return {"message": "Password changed successfully. All previous sessions invalidated."}


@router.post("/logout")
def logout(
    payload: RefreshTokenRequest | None = None,
    current_user: AdminUser = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Revoke specific refresh token or all user refresh tokens on logout."""
    if payload and payload.refresh_token:
        raw_hash = hash_token(payload.refresh_token)
        stored_token = (
            db.query(AdminRefreshToken)
            .filter(AdminRefreshToken.token_hash == raw_hash)
            .first()
        )
        if stored_token:
            stored_token.is_revoked = True
    else:
        # Revoke all active tokens for this user
        db.query(AdminRefreshToken).filter(
            AdminRefreshToken.user_id == current_user.id,
            AdminRefreshToken.is_revoked.is_(False),
        ).update({"is_revoked": True})

    db.commit()
    return {"message": "Logged out successfully. Session invalidated."}
