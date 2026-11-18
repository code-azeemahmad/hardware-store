import enum
import uuid
from decimal import Decimal
from typing import Any
from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, Numeric, String, Table, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

# Association table for Many-to-Many Product <-> Category relationship
product_categories = Table(
    "product_categories",
    Base.metadata,
    Column(
        "product_id",
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "category_id",
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class StockStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    ORDER_BASED = "order_based"
    OUT_OF_STOCK = "out_of_stock"


class Brand(Base, TimestampMixin):
    __tablename__ = "brands"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="brand")


class Attribute(Base, TimestampMixin):
    """Specification attribute definition (e.g. Material, Finish, Thickness, Origin)."""
    __tablename__ = "attributes"

    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(200), nullable=False)
    name_ur: Mapped[str] = mapped_column(String(200), nullable=False)
    is_filterable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    values: Mapped[list["ProductAttributeValue"]] = relationship(
        "ProductAttributeValue", back_populates="attribute", cascade="all, delete-orphan"
    )


class ProductAttributeValue(Base, TimestampMixin):
    """Product-specific attribute value."""
    __tablename__ = "product_attribute_values"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attribute_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("attributes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    value_en: Mapped[str] = mapped_column(String(300), nullable=False)
    value_ur: Mapped[str] = mapped_column(String(300), nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="attribute_values")
    attribute: Mapped[Attribute] = relationship(Attribute, back_populates="values")


class ProductVariant(Base, TimestampMixin):
    """Optional product variants (e.g. sheet dimensions, lock finishes, handle sizes)."""
    __tablename__ = "product_variants"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    name_en: Mapped[str] = mapped_column(String(300), nullable=False)
    name_ur: Mapped[str] = mapped_column(String(300), nullable=False)

    price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    price_on_request: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    stock_status: Mapped[StockStatus] = mapped_column(
        Enum(
            StockStatus,
            name="stockstatus",
            values_callable=lambda x: [e.value for e in x],
            create_constraint=False,
        ),
        default=StockStatus.ORDER_BASED,
        nullable=False,
    )
    specifications: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="variants")


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    name_en: Mapped[str] = mapped_column(String(300), nullable=False)
    name_ur: Mapped[str] = mapped_column(String(300), nullable=False)
    short_description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Hybrid Pricing Model (defaults to Price on Request)
    price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    price_on_request: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    stock_status: Mapped[StockStatus] = mapped_column(
        Enum(
            StockStatus,
            name="stockstatus",
            values_callable=lambda x: [e.value for e in x],
            create_constraint=False,
        ),
        default=StockStatus.ORDER_BASED,
        nullable=False,
    )

    # Structured key-value technical specifications (JSONB)
    specifications: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)

    # Localized SEO Metadata
    meta_title_en: Mapped[str | None] = mapped_column(String(300), nullable=True)
    meta_title_ur: Mapped[str | None] = mapped_column(String(300), nullable=True)
    meta_description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    meta_description_ur: Mapped[str | None] = mapped_column(Text, nullable=True)

    brand_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("brands.id", ondelete="SET NULL"), nullable=True, index=True
    )
    brand: Mapped[Brand | None] = relationship("Brand", back_populates="products")

    categories: Mapped[list["Category"]] = relationship(
        "Category", secondary=product_categories, back_populates="products"
    )
    images: Mapped[list["ProductImage"]] = relationship(
        "ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order"
    )
    attribute_values: Mapped[list[ProductAttributeValue]] = relationship(
        "ProductAttributeValue", back_populates="product", cascade="all, delete-orphan"
    )
    variants: Mapped[list[ProductVariant]] = relationship(
        "ProductVariant", back_populates="product", cascade="all, delete-orphan", order_by="ProductVariant.sort_order"
    )


class ProductImage(Base, TimestampMixin):
    __tablename__ = "product_images"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text_en: Mapped[str | None] = mapped_column(String(300), nullable=True)
    alt_text_ur: Mapped[str | None] = mapped_column(String(300), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    product: Mapped[Product] = relationship("Product", back_populates="images")
