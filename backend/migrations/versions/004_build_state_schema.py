"""Site Build State Schema

Revision ID: 004_build_state_schema
Revises: 003_refresh_tokens_schema
Create Date: 2026-11-19 04:12:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "004_build_state_schema"
down_revision: Union[str, None] = "003_refresh_tokens_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "site_build_state",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="idle"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.Column(
            "message",
            sa.String(length=512),
            nullable=False,
            server_default="System idle. Ready to publish changes.",
        ),
        sa.Column("error_detail", sa.Text(), nullable=True),
        sa.Column("triggered_by", sa.String(length=255), nullable=True),
        sa.Column("active_release_id", sa.String(length=128), nullable=True),
        sa.Column("previous_release_id", sa.String(length=128), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    # Insert default singleton row (id=1)
    op.execute(
        sa.text(
            "INSERT INTO site_build_state (id, status, message, active_release_id) "
            "VALUES (1, 'idle', 'System idle. Ready to publish changes.', 'release_init')"
        )
    )


def downgrade() -> None:
    op.drop_table("site_build_state")
