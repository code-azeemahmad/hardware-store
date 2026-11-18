import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_active_user, require_roles
from app.core.security import generate_invitation_token, get_password_hash, hash_invitation_token
from app.db.session import get_db
from app.models.user import AdminInvitation, AdminRole, AdminUser
from app.schemas.user import (
    InvitationAccept,
    InvitationCreate,
    InvitationCreateResponse,
    InvitationRead,
    UserRead,
)

router = APIRouter(prefix="/invitations", tags=["admin-invitations"])


@router.post("", response_model=InvitationCreateResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(
    data: InvitationCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
):
    """Generate a single-use staff invitation link (Super Admin only)."""
    # Check if user already exists
    existing_user = db.query(AdminUser).filter(AdminUser.email == data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{data.email}' already exists",
        )

    # Revoke any prior pending invitations for this email
    prior_invites = (
        db.query(AdminInvitation)
        .filter(AdminInvitation.email == data.email, AdminInvitation.accepted_at.is_(None))
        .all()
    )
    for inv in prior_invites:
        inv.is_revoked = True

    token = generate_invitation_token()
    token_hash = hash_invitation_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.INVITATION_TOKEN_EXPIRE_HOURS)

    invitation = AdminInvitation(
        email=data.email,
        token_hash=token_hash,
        role=data.role,
        expires_at=expires_at,
        invited_by_id=current_user.id,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    invitation_link = f"{settings.PUBLIC_SITE_URL}/admin/accept-invitation?token={token}"

    return InvitationCreateResponse(
        id=invitation.id,
        email=invitation.email,
        role=invitation.role,
        expires_at=invitation.expires_at,
        invitation_token=token,
        invitation_link=invitation_link,
    )


@router.get("", response_model=list[InvitationRead])
def list_invitations(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
):
    """List all staff invitations (Super Admin only)."""
    return db.query(AdminInvitation).order_by(AdminInvitation.created_at.desc()).all()


@router.delete("/{invitation_id}", status_code=status.HTTP_200_OK)
def revoke_invitation(
    invitation_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
):
    """Revoke an invitation so it can no longer be used."""
    inv = db.query(AdminInvitation).filter(AdminInvitation.id == invitation_id).first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    inv.is_revoked = True
    db.commit()
    return {"message": "Invitation revoked successfully"}


@router.post("/accept", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def accept_invitation(payload: InvitationAccept, db: Session = Depends(get_db)):
    """Public endpoint to accept an invitation token and initialize staff account."""
    token_hash = hash_invitation_token(payload.token)
    invitation = db.query(AdminInvitation).filter(AdminInvitation.token_hash == token_hash).first()

    if not invitation:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invitation token")

    if invitation.is_revoked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This invitation has been revoked")

    if invitation.accepted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This invitation has already been accepted"
        )

    now = datetime.now(timezone.utc)
    exp = invitation.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This invitation token has expired"
        )

    # Check if user with this email somehow exists now
    if db.query(AdminUser).filter(AdminUser.email == invitation.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists"
        )

    # Create active admin user
    new_user = AdminUser(
        email=invitation.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=invitation.role,
        is_active=True,
    )
    db.add(new_user)

    # Mark invitation as accepted
    invitation.accepted_at = now
    db.commit()
    db.refresh(new_user)

    return new_user
