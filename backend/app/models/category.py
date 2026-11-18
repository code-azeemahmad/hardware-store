import uuid
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_ur: Mapped[str] = mapped_column(String(200), nullable=False)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    # Localized SEO Metadata
    meta_title_en: Mapped[str | None] = mapped_column(String(300), nullable=True)
    meta_title_ur: Mapped[str | None] = mapped_column(String(300), nullable=True)
    meta_description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    parent: Mapped["Category | None"] = relationship(
        "Category", remote_side="Category.id", back_populates="children"
    )
    children: Mapped[list["Category"]] = relationship(
        "Category", back_populates="parent", cascade="all, delete-orphan"
    )
    products: Mapped[list["Product"]] = relationship(
        "Product", secondary="product_categories", back_populates="categories"
    )
