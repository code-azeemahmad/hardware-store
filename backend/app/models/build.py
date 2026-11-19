import enum
from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class BuildStatus(str, enum.Enum):
    IDLE = "idle"
    BUILDING = "building"
    SUCCESS = "success"
    FAILED = "failed"


class SiteBuildState(Base, TimestampMixin):
    __tablename__ = "site_build_state"

    id: Mapped[int] = mapped_column(sa.Integer, primary_key=True)
    status: Mapped[str] = mapped_column(
        sa.String(32), default=BuildStatus.IDLE.value, nullable=False
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        sa.DateTime(timezone=True), nullable=True
    )
    duration_seconds: Mapped[Optional[float]] = mapped_column(sa.Float, nullable=True)
    message: Mapped[str] = mapped_column(
        sa.String(512),
        default="System idle. Ready to publish changes.",
        nullable=False,
    )
    error_detail: Mapped[Optional[str]] = mapped_column(sa.Text, nullable=True)
    triggered_by: Mapped[Optional[str]] = mapped_column(sa.String(255), nullable=True)
    active_release_id: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
    previous_release_id: Mapped[Optional[str]] = mapped_column(sa.String(128), nullable=True)
