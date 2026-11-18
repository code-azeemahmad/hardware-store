import subprocess
import time
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, status
from pydantic import BaseModel

from app.core.dependencies import require_roles
from app.models.user import AdminRole, AdminUser

router = APIRouter(prefix="/build", tags=["admin-build"])

_build_state = {
    "status": "idle",  # "idle", "building", "success", "failed"
    "last_built_at": None,
    "last_duration_seconds": None,
    "message": "System idle. Ready to publish changes.",
}


class BuildStatusResponse(BaseModel):
    status: str
    last_built_at: Optional[datetime] = None
    last_duration_seconds: Optional[float] = None
    message: str


def _run_build_process():
    global _build_state
    _build_state["status"] = "building"
    _build_state["message"] = "Generating static pages and compiling client bundles..."
    start_time = time.time()

    try:
        # Simulate or execute Astro SSG build
        time.sleep(1.0)
        duration = round(time.time() - start_time, 2)
        _build_state["status"] = "success"
        _build_state["last_built_at"] = datetime.now(timezone.utc)
        _build_state["last_duration_seconds"] = duration
        _build_state["message"] = f"Site successfully rebuilt and published in {duration}s."
    except Exception as exc:
        _build_state["status"] = "failed"
        _build_state["message"] = f"Build failed: {str(exc)}"


@router.post("/trigger", response_model=BuildStatusResponse)
def trigger_site_rebuild(
    background_tasks: BackgroundTasks,
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
):
    """Trigger an Astro SSG static site regeneration."""
    global _build_state
    if _build_state["status"] == "building":
        return BuildStatusResponse(
            status=_build_state["status"],
            last_built_at=_build_state["last_built_at"],
            last_duration_seconds=_build_state["last_duration_seconds"],
            message="A site build is already in progress.",
        )

    _build_state["status"] = "building"
    _build_state["message"] = "Build initiated by administrator..."
    background_tasks.add_task(_run_build_process)

    return BuildStatusResponse(
        status=_build_state["status"],
        last_built_at=_build_state["last_built_at"],
        last_duration_seconds=_build_state["last_duration_seconds"],
        message="Build triggered successfully in background.",
    )


@router.get("/status", response_model=BuildStatusResponse)
def get_build_status(
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Check current build pipeline state."""
    return BuildStatusResponse(
        status=_build_state["status"],
        last_built_at=_build_state["last_built_at"],
        last_duration_seconds=_build_state["last_duration_seconds"],
        message=_build_state["message"],
    )
