"""Initial Schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-11-18 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Admin Users
    op.create_table(
        "admin_users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("SUPER_ADMIN", "ADMIN", "CATALOGUE_EDITOR", "ENQUIRY_HANDLER", name="adminrole"),
            nullable=False,
            server_default="ADMIN",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_admin_users_email", "admin_users", ["email"])
    op.create_index("ix_admin_users_id", "admin_users", ["id"])

    # 2. Admin Invitations
    op.create_table(
        "admin_invitations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("token_hash", sa.String(255), nullable=False, unique=True),
        sa.Column(
            "role",
            sa.Enum("SUPER_ADMIN", "ADMIN", "CATALOGUE_EDITOR", "ENQUIRY_HANDLER", name="adminrole"),
            nullable=False,
            server_default="ADMIN",
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_revoked", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("invited_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_admin_invitations_email", "admin_invitations", ["email"])
    op.create_index("ix_admin_invitations_token_hash", "admin_invitations", ["token_hash"])

    # 3. Categories
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("name_en", sa.String(200), nullable=False),
        sa.Column("name_ur", sa.String(200), nullable=False),
        sa.Column("description_en", sa.Text(), nullable=True),
        sa.Column("description_ur", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])
    op.create_index("ix_categories_is_published", "categories", ["is_published"])
    op.create_index("ix_categories_parent_id", "categories", ["parent_id"])

    # 4. Brands
    op.create_table(
        "brands",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("logo_url", sa.String(500), nullable=True),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_brands_slug", "brands", ["slug"])

    # 5. Products
    op.create_table(
        "products",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(200), nullable=False, unique=True),
        sa.Column("sku", sa.String(100), nullable=True, unique=True),
        sa.Column("name_en", sa.String(300), nullable=False),
        sa.Column("name_ur", sa.String(300), nullable=False),
        sa.Column("short_description_en", sa.Text(), nullable=True),
        sa.Column("short_description_ur", sa.Text(), nullable=True),
        sa.Column("description_en", sa.Text(), nullable=True),
        sa.Column("description_ur", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=True),
        sa.Column("price_on_request", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_best_seller", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("brands.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_products_slug", "products", ["slug"])
    op.create_index("ix_products_sku", "products", ["sku"])
    op.create_index("ix_products_is_published", "products", ["is_published"])
    op.create_index("ix_products_is_featured", "products", ["is_featured"])
    op.create_index("ix_products_is_best_seller", "products", ["is_best_seller"])

    # 6. Product Categories (Join Table)
    op.create_table(
        "product_categories",
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True),
    )

    # 7. Product Images
    op.create_table(
        "product_images",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("alt_text_en", sa.String(300), nullable=True),
        sa.Column("alt_text_ur", sa.String(300), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])

    # 8. Enquiries
    op.create_table(
        "enquiries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "type",
            sa.Enum("PRODUCT", "GENERAL", name="enquirytype"),
            nullable=False,
            server_default="GENERAL",
        ),
        sa.Column(
            "status",
            sa.Enum("NEW", "IN_PROGRESS", "RESOLVED", "SPAM", name="enquirystatus"),
            nullable=False,
            server_default="NEW",
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en"),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_enquiries_status", "enquiries", ["status"])
    op.create_index("ix_enquiries_product_id", "enquiries", ["product_id"])


def downgrade() -> None:
    op.drop_table("enquiries")
    op.execute("DROP TYPE IF EXISTS enquirystatus")
    op.execute("DROP TYPE IF EXISTS enquirytype")
    op.drop_table("product_images")
    op.drop_table("product_categories")
    op.drop_table("products")
    op.drop_table("brands")
    op.drop_table("categories")
    op.drop_table("admin_invitations")
    op.drop_table("admin_users")
    op.execute("DROP TYPE IF EXISTS adminrole")
