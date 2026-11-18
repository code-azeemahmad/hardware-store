import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enquiry import EnquiryType, EnquiryStatus


class EnquiryCreate(BaseModel):
    type: EnquiryType = EnquiryType.GENERAL
    name: str = Field(..., min_length=2, max_length=200)
    phone: str = Field(..., min_length=5, max_length=50)
    email: Optional[EmailStr] = None
    message: str = Field(..., min_length=5, max_length=2000)
    locale: str = Field("en", max_length=10)
    product_id: Optional[uuid.UUID] = None


class EnquiryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: EnquiryType
    status: EnquiryStatus
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    locale: str
    product_id: Optional[uuid.UUID] = None
