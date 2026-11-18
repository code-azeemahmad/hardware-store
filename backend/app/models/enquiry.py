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


class EnquiryChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    CALL = "call"
    FORM = "form"


class Enquiry(Base, TimestampMixin):
    __tablename__ = "enquiries"

    type: Mapped[EnquiryType] = mapped_column(
        Enum(EnquiryType, name="enquirytype", create_constraint=False),
        default=EnquiryType.GENERAL,
        nullable=False,
    )
    status: Mapped[EnquiryStatus] = mapped_column(
        Enum(EnquiryStatus, name="enquirystatus", create_constraint=False),
        default=EnquiryStatus.NEW,
        nullable=False,
        index=True,
    )
    channel: Mapped[EnquiryChannel] = mapped_column(
        Enum(
            EnquiryChannel,
            name="enquirychannel",
            values_callable=lambda x: [e.value for e in x],
            create_constraint=False,
        ),
        default=EnquiryChannel.FORM,
        nullable=False,
        server_default="form",
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    locale: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)

    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True
    )
