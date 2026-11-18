import re
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enquiry import EnquiryChannel, EnquiryStatus, EnquiryType


class EnquiryCreate(BaseModel):
    type: EnquiryType = EnquiryType.GENERAL
    name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=5, max_length=50)
    email: Optional[EmailStr] = None
    message: str = Field(..., min_length=5, max_length=3000)
    locale: str = Field("en", max_length=10)
    channel: EnquiryChannel = EnquiryChannel.FORM
    product_id: Optional[uuid.UUID] = None

    # Anti-spam honeypot field (must be left empty by humans)
    hp_field: Optional[str] = Field(None, max_length=100)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return clean

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = v.strip()
        digits = re.sub(r"\D", "", clean)
        if len(digits) < 7:
            raise ValueError("Phone number must contain at least 7 digits")
        if not re.match(r"^[\d\+\-\s\(\)\.]+$", clean):
            raise ValueError("Phone number contains invalid characters")
        return clean

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 5:
            raise ValueError("Message must be at least 5 characters long")
        return clean


class EnquiryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: EnquiryType
    status: EnquiryStatus
    channel: EnquiryChannel
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    locale: str
    product_id: Optional[uuid.UUID] = None
    created_at: datetime


class EnquiryAdminDetail(EnquiryRead):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    product_name_en: Optional[str] = None
    product_slug: Optional[str] = None
    updated_at: datetime


class EnquiryStatusUpdate(BaseModel):
    status: EnquiryStatus
