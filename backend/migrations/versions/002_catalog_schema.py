"""Catalog Schema Enhancements (Attributes, Variants, Specifications, SEO)

Revision ID: 002_catalog_schema
Revises: 001_initial_schema
Create Date: 2026-11-18 16:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002_catalog_schema"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create Enums
    stockstatus_enum = postgresql.ENUM("in_stock", "order_based", "out_of_stock", name="stockstatus")
    stockstatus_enum.create(op.get_bind(), checkfirst=True)

    enquirychannel_enum = postgresql.ENUM("whatsapp", "call", "form", name="enquirychannel")
    enquirychannel_enum.create(op.get_bind(), checkfirst=True)

    # 2. Add Columns to Brands
    op.add_column("brands", sa.Column("description_en", sa.Text(), nullable=True))
    op.add_column("brands", sa.Column("description_ur", sa.Text(), nullable=True))
    op.add_column("brands", sa.Column("website_url", sa.String(500), nullable=True))
    op.add_column("brands", sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"))

    # 3. Add Localized SEO Columns to Categories
    op.add_column("categories", sa.Column("meta_title_en", sa.String(300), nullable=True))
    op.add_column("categories", sa.Column("meta_title_ur", sa.String(300), nullable=True))
    op.add_column("categories", sa.Column("meta_description_en", sa.Text(), nullable=True))
    op.add_column("categories", sa.Column("meta_description_ur", sa.Text(), nullable=True))

    # 4. Add Columns to Products
    op.add_column(
        "products",
        sa.Column(
            "stock_status",
            sa.Enum("in_stock", "order_based", "out_of_stock", name="stockstatus", create_type=False),
            nullable=False,
            server_default="order_based",
        ),
    )
    op.add_column("products", sa.Column("specifications", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("products", sa.Column("meta_title_en", sa.String(300), nullable=True))
    op.add_column("products", sa.Column("meta_title_ur", sa.String(300), nullable=True))
    op.add_column("products", sa.Column("meta_description_en", sa.Text(), nullable=True))
    op.add_column("products", sa.Column("meta_description_ur", sa.Text(), nullable=True))

    # 5. Add Columns to Enquiries
    op.add_column(
        "enquiries",
        sa.Column(
            "channel",
            sa.Enum("whatsapp", "call", "form", name="enquirychannel", create_type=False),
            nullable=False,
            server_default="form",
        ),
    )
    op.add_column("enquiries", sa.Column("ip_address", sa.String(45), nullable=True))
    op.add_column("enquiries", sa.Column("user_agent", sa.String(500), nullable=True))

    # 6. Attributes Table
    op.create_table(
        "attributes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("name_en", sa.String(200), nullable=False),
        sa.Column("name_ur", sa.String(200), nullable=False),
        sa.Column("is_filterable", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_attributes_slug", "attributes", ["slug"])

    # 7. Product Attribute Values Table
    op.create_table(
        "product_attribute_values",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "attribute_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("attributes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("value_en", sa.String(300), nullable=False),
        sa.Column("value_ur", sa.String(300), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_product_attribute_values_product_id", "product_attribute_values", ["product_id"])
    op.create_index("ix_product_attribute_values_attribute_id", "product_attribute_values", ["attribute_id"])

    # 8. Product Variants Table
    op.create_table(
        "product_variants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "product_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("products.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("sku", sa.String(100), nullable=True, unique=True),
        sa.Column("name_en", sa.String(300), nullable=False),
        sa.Column("name_ur", sa.String(300), nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=True),
        sa.Column("price_on_request", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "stock_status",
            sa.Enum("in_stock", "order_based", "out_of_stock", name="stockstatus", create_type=False),
            nullable=False,
            server_default="order_based",
        ),
        sa.Column("specifications", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])
    op.create_index("ix_product_variants_sku", "product_variants", ["sku"])


def downgrade() -> None:
    op.drop_table("product_variants")
    op.drop_table("product_attribute_values")
    op.drop_table("attributes")

    op.drop_column("enquiries", "user_agent")
    op.drop_column("enquiries", "ip_address")
    op.drop_column("enquiries", "channel")

    op.drop_column("products", "meta_description_ur")
    op.drop_column("products", "meta_description_en")
    op.drop_column("products", "meta_title_ur")
    op.drop_column("products", "meta_title_en")
    op.drop_column("products", "specifications")
    op.drop_column("products", "stock_status")

    op.drop_column("categories", "meta_description_ur")
    op.drop_column("categories", "meta_description_en")
    op.drop_column("categories", "meta_title_ur")
    op.drop_column("categories", "meta_title_en")

    op.drop_column("brands", "sort_order")
    op.drop_column("brands", "website_url")
    op.drop_column("brands", "description_ur")
    op.drop_column("brands", "description_en")

    op.execute("DROP TYPE IF EXISTS enquirychannel")
    op.execute("DROP TYPE IF EXISTS stockstatus")
