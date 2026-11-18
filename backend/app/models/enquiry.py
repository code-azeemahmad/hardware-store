import enum
import uuid
from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class EnquiryType(str, enum.Enum):
    PRODUCT = "product"
    GENERAL = "general"


class EnquiryStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    SPAM = "spam"


class Enquiry(Base, TimestampMixin):
    __tablename__ = "enquiries"

    type: Mapped[EnquiryType] = mapped_column(Enum(EnquiryType), default=EnquiryType.GENERAL, nullable=False)
    status: Mapped[EnquiryStatus] = mapped_column(Enum(EnquiryStatus), default=EnquiryStatus.NEW, nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True
    )
