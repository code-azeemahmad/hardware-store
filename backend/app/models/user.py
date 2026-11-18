import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class AdminRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CATALOGUE_EDITOR = "catalogue_editor"
    ENQUIRY_HANDLER = "enquiry_handler"


class AdminUser(Base, TimestampMixin):
    __tablename__ = "admin_users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[AdminRole] = mapped_column(
        Enum(AdminRole), default=AdminRole.ADMIN, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    sent_invitations: Mapped[list["AdminInvitation"]] = relationship(
        "AdminInvitation", back_populates="invited_by", foreign_keys="AdminInvitation.invited_by_id"
    )


class AdminInvitation(Base, TimestampMixin):
    __tablename__ = "admin_invitations"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    role: Mapped[AdminRole] = mapped_column(Enum(AdminRole), default=AdminRole.ADMIN, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    invited_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False
    )
    invited_by: Mapped[AdminUser] = relationship(
        "AdminUser", back_populates="sent_invitations", foreign_keys=[invited_by_id]
    )
