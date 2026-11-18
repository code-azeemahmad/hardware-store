import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import AdminRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: AdminRole
    is_active: bool
    last_login_at: Optional[datetime] = None


class InvitationCreate(BaseModel):
    email: EmailStr
    role: AdminRole = AdminRole.ADMIN


class InvitationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    role: AdminRole
    expires_at: datetime
    accepted_at: Optional[datetime] = None
    is_revoked: bool
    created_at: datetime


class InvitationCreateResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: AdminRole
    expires_at: datetime
    invitation_token: str
    invitation_link: str


class InvitationAccept(BaseModel):
    token: str = Field(..., min_length=10)
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
