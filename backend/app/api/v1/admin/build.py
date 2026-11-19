import os
import re
import shutil
import subprocess
import time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel
import sqlalchemy as sa
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.session import SessionLocal, get_db
from app.models.build import BuildStatus, SiteBuildState
from app.models.user import AdminRole, AdminUser

router = APIRouter(prefix="/build", tags=["admin-build"])

# 64-bit integer PostgreSQL advisory lock ID for site builds
BUILD_ADVISORY_LOCK_ID = 9876543210123
MAX_RELEASES_TO_KEEP = 5


class BuildStatusResponse(BaseModel):
    status: str
    last_built_at: Optional[datetime] = None
    last_duration_seconds: Optional[float] = None
    message: str
    active_release_id: Optional[str] = None
    previous_release_id: Optional[str] = None


def _find_frontend_dir() -> str:
    env_dir = os.environ.get("FRONTEND_DIR")
    if env_dir and os.path.exists(env_dir):
        return env_dir

    candidates = [
        "/frontend",
        os.path.join(os.getcwd(), "..", "frontend"),
        os.path.join(os.getcwd(), "frontend"),
        "/app/../frontend",
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.exists(os.path.join(c, "package.json")):
            return os.path.abspath(c)

    raise FileNotFoundError("Could not locate frontend directory containing package.json")


def _sanitize_error(error_text: str) -> str:
    """Strip database credentials, secrets, and sensitive tokens from build logs."""
    if not error_text:
        return ""
    # Redact postgresql connection URLs with passwords
    sanitized = re.sub(
        r"postgresql(\+\w+)?://[^:]+:[^@]+@",
        "postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@",
        error_text,
    )
    # Redact potential secret keys and tokens
    sanitized = re.sub(r"(SECRET_KEY|password|token)=[^\s&'\"]+", r"\1=[REDACTED]", sanitized, flags=re.I)
    return sanitized.strip()


def _get_or_create_build_state(db: Session) -> SiteBuildState:
    state = db.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(
            id=1,
            status=BuildStatus.IDLE.value,
            message="System idle. Ready to publish changes.",
            active_release_id="release_init",
        )
        db.add(state)
        db.commit()
        db.refresh(state)
    return state


def _prune_old_releases(releases_dir: str, active_id: Optional[str], previous_id: Optional[str]):
    """Retains the most recent MAX_RELEASES_TO_KEEP releases and prunes older ones."""
    if not os.path.exists(releases_dir):
        return

    entries = []
    for entry in os.listdir(releases_dir):
        full_path = os.path.join(releases_dir, entry)
        if os.path.isdir(full_path):
            entries.append((entry, os.path.getmtime(full_path), full_path))

    # Sort newest first
    entries.sort(key=lambda x: x[1], reverse=True)

    # Keep newest 5; never delete active or previous release
    protected = {active_id, previous_id, "release_init"}
    to_delete = entries[MAX_RELEASES_TO_KEEP:]
    for name, _, path in to_delete:
        if name not in protected:
            shutil.rmtree(path, ignore_errors=True)


def _run_build_process(
    triggered_by_email: Optional[str] = None, custom_db: Optional[Session] = None
):
    """Executes background Astro SSG generation with atomic release deployment and rollback retention."""
    db: Session = custom_db if custom_db is not None else SessionLocal()
    lock_acquired = False
    release_path = None
    is_postgres = bool(db.bind and db.bind.dialect.name == "postgresql")

    try:
        # Acquire PostgreSQL session-level advisory lock if running on PostgreSQL
        if is_postgres:
            res = db.execute(
                sa.text("SELECT pg_try_advisory_lock(:lock_id)"),
                {"lock_id": BUILD_ADVISORY_LOCK_ID},
            ).scalar()
            if not res:
                # Another worker holds the advisory lock
                return
            lock_acquired = True
        else:
            lock_acquired = True

        state = _get_or_create_build_state(db)
        state.status = BuildStatus.BUILDING.value
        state.started_at = datetime.now(timezone.utc)
        state.message = "Static site generation in progress..."
        state.triggered_by = triggered_by_email
        db.commit()

        start_time = time.time()
        frontend_dir = _find_frontend_dir()
        astro_cli = os.path.join(frontend_dir, "node_modules", "astro", "astro.js")

        deploy_dir = os.path.join(frontend_dir, "deploy")
        releases_dir = os.path.join(deploy_dir, "releases")
        os.makedirs(releases_dir, exist_ok=True)

        release_id = f"release_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}"
        release_path = os.path.join(releases_dir, release_id)
        os.makedirs(release_path, exist_ok=True)

        rel_out_dir = os.path.join("deploy", "releases", release_id)

        # Environment configured for strict production build (no silent fixture fallbacks)
        env = os.environ.copy()
        env["STRICT_API"] = "true"
        env["ALLOW_FIXTURE_FALLBACK"] = "false"
        env["APP_ENV"] = "production"
        env["INTERNAL_API_URL"] = os.environ.get(
            "INTERNAL_API_URL", "http://localhost:8000/api/v1"
        )
        env["PUBLIC_SITE_URL"] = os.environ.get("PUBLIC_SITE_URL", "http://localhost")

        # Compile Astro SSG
        cmd = ["node", astro_cli, "build", "--outDir", rel_out_dir]
        proc = subprocess.run(
            cmd,
            cwd=frontend_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=180,
        )

        if proc.returncode != 0:
            error_msg = proc.stderr.strip() or proc.stdout.strip() or "Unknown compilation error"
            raise RuntimeError(f"Astro compilation failed (code {proc.returncode}): {error_msg[-500:]}")

        # Strict Integrity Verification
        index_en = os.path.join(release_path, "index.html")
        index_ur = os.path.join(release_path, "ur", "index.html")
        sitemap = os.path.join(release_path, "sitemap.xml")

        if not os.path.exists(index_en) or os.path.getsize(index_en) == 0:
            raise RuntimeError("Build integrity check failed: missing or empty index.html")
        if not os.path.exists(index_ur) or os.path.getsize(index_ur) == 0:
            raise RuntimeError("Build integrity check failed: missing or empty /ur/index.html")
        if not os.path.exists(sitemap) or os.path.getsize(sitemap) == 0:
            raise RuntimeError("Build integrity check failed: missing or empty sitemap.xml")

        # Atomic Deployment: POSIX symlink swap via os.replace()
        current_symlink = os.path.join(deploy_dir, "current")
        current_tmp = os.path.join(deploy_dir, f"current_tmp_{int(time.time())}")
        rel_target = os.path.join("releases", release_id)

        if os.path.lexists(current_tmp):
            os.remove(current_tmp)
        os.symlink(rel_target, current_tmp)
        os.replace(current_tmp, current_symlink)

        # Update build state in database
        duration = round(time.time() - start_time, 2)
        state.previous_release_id = state.active_release_id
        state.active_release_id = release_id
        state.status = BuildStatus.SUCCESS.value
        state.completed_at = datetime.now(timezone.utc)
        state.duration_seconds = duration
        state.message = f"Catalogue published successfully in {duration}s (Active release: {release_id})."
        state.error_detail = None
        db.commit()

        # Prune old releases while keeping recent ones for rollback
        _prune_old_releases(releases_dir, state.active_release_id, state.previous_release_id)

    except Exception as exc:
        if release_path and os.path.exists(release_path):
            shutil.rmtree(release_path, ignore_errors=True)

        sanitized_msg = _sanitize_error(str(exc))
        try:
            state = _get_or_create_build_state(db)
            state.status = BuildStatus.FAILED.value
            state.completed_at = datetime.now(timezone.utc)
            state.duration_seconds = round(time.time() - start_time, 2) if "start_time" in locals() else None
            state.message = f"Build failed: {sanitized_msg[:250]}"
            state.error_detail = sanitized_msg
            db.commit()
        except Exception:
            pass

    finally:
        if lock_acquired and is_postgres:
            try:
                db.execute(
                    sa.text("SELECT pg_advisory_unlock(:lock_id)"),
                    {"lock_id": BUILD_ADVISORY_LOCK_ID},
                )
                db.commit()
            except Exception:
                pass
        if custom_db is None:
            db.close()


@router.post("/trigger", response_model=BuildStatusResponse, status_code=status.HTTP_200_OK)
def trigger_site_rebuild(
    background_tasks: BackgroundTasks,
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
    db: Session = Depends(get_db),
):
    """Trigger an Astro SSG static site regeneration (Super Admin only)."""
    # Check if lock can be acquired or if state is currently building
    state = _get_or_create_build_state(db)
    if state.status == BuildStatus.BUILDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A site build is already in progress across workers. Please wait for completion.",
        )

    is_postgres = bool(db.bind and db.bind.dialect.name == "postgresql")
    if is_postgres:
        # Probe PostgreSQL advisory lock
        lock_free = db.execute(
            sa.text("SELECT pg_try_advisory_lock(:lock_id)"),
            {"lock_id": BUILD_ADVISORY_LOCK_ID},
        ).scalar()
        if not lock_free:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Build lock is currently held by another worker process. Please wait.",
            )

        # Release the test probe lock immediately so background task can acquire it
        db.execute(
            sa.text("SELECT pg_advisory_unlock(:lock_id)"),
            {"lock_id": BUILD_ADVISORY_LOCK_ID},
        )
        db.commit()

    state.status = BuildStatus.BUILDING.value
    state.message = f"Build initiated by {current_user.email}..."
    state.triggered_by = current_user.email
    db.commit()

    background_tasks.add_task(_run_build_process, triggered_by_email=current_user.email)

    return BuildStatusResponse(
        status=state.status,
        last_built_at=state.completed_at,
        last_duration_seconds=state.duration_seconds,
        message="Build triggered successfully in background.",
        active_release_id=state.active_release_id,
        previous_release_id=state.previous_release_id,
    )


@router.post("/rollback", response_model=BuildStatusResponse, status_code=status.HTTP_200_OK)
def rollback_site_release(
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN])),
    db: Session = Depends(get_db),
):
    """Instantly roll back public site pointer to previous release (Super Admin only)."""
    state = _get_or_create_build_state(db)
    if state.status == BuildStatus.BUILDING.value:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot roll back while a build is currently in progress.",
        )

    target_release = state.previous_release_id
    frontend_dir = _find_frontend_dir()
    deploy_dir = os.path.join(frontend_dir, "deploy")
    releases_dir = os.path.join(deploy_dir, "releases")

    if not target_release or not os.path.exists(os.path.join(releases_dir, target_release)):
        # Look for most recent existing release that is not active
        available = [
            d for d in os.listdir(releases_dir)
            if os.path.isdir(os.path.join(releases_dir, d)) and d != state.active_release_id
        ]
        if not available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No previous release available to roll back to.",
            )
        available.sort(key=lambda d: os.path.getmtime(os.path.join(releases_dir, d)), reverse=True)
        target_release = available[0]

    # Atomic switch to target release
    current_symlink = os.path.join(deploy_dir, "current")
    current_tmp = os.path.join(deploy_dir, f"current_tmp_{int(time.time())}")
    rel_target = os.path.join("releases", target_release)

    if os.path.lexists(current_tmp):
        os.remove(current_tmp)
    os.symlink(rel_target, current_tmp)
    os.replace(current_tmp, current_symlink)

    # Update state
    old_active = state.active_release_id
    state.active_release_id = target_release
    state.previous_release_id = old_active
    state.message = f"Rolled back from {old_active} to {target_release} by {current_user.email}."
    state.status = BuildStatus.SUCCESS.value
    db.commit()

    return BuildStatusResponse(
        status=state.status,
        last_built_at=state.completed_at,
        last_duration_seconds=state.duration_seconds,
        message=state.message,
        active_release_id=state.active_release_id,
        previous_release_id=state.previous_release_id,
    )


@router.get("/status", response_model=BuildStatusResponse)
def get_build_status(
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
    db: Session = Depends(get_db),
):
    """Check current build pipeline state from PostgreSQL."""
    state = _get_or_create_build_state(db)
    return BuildStatusResponse(
        status=state.status,
        last_built_at=state.completed_at,
        last_duration_seconds=state.duration_seconds,
        message=state.message,
        active_release_id=state.active_release_id,
        previous_release_id=state.previous_release_id,
    )
