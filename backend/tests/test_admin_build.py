import pytest
from starlette.testclient import TestClient


def test_dashboard_metrics_unauthorized(client: TestClient):
    res = client.get("/api/v1/admin/dashboard/metrics")
    assert res.status_code == 401


def test_dashboard_metrics(super_admin_client: TestClient):
    res = super_admin_client.get("/api/v1/admin/dashboard/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "total_products" in data
    assert "total_categories" in data
    assert "total_brands" in data
    assert "total_enquiries" in data
    assert "missing_urdu_translations" in data
    assert "recent_enquiries" in data


def test_build_trigger_and_status(super_admin_client: TestClient):
    # 1. Check initial status
    status_res = super_admin_client.get("/api/v1/admin/build/status")
    assert status_res.status_code == 200
    assert "status" in status_res.json()

    # 2. Trigger rebuild
    trigger_res = super_admin_client.post("/api/v1/admin/build/trigger")
    assert trigger_res.status_code == 200
    data = trigger_res.json()
    assert data["status"] in ["building", "success", "idle"]


def test_editor_cannot_trigger_build(editor_client: TestClient):
    res = editor_client.post("/api/v1/admin/build/trigger")
    assert res.status_code == 403


def test_concurrent_build_trigger_conflict(super_admin_client: TestClient, db_session):
    from app.models.build import SiteBuildState, BuildStatus

    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(id=1, status=BuildStatus.IDLE.value)
        db_session.add(state)
    state.status = BuildStatus.BUILDING.value
    db_session.commit()

    try:
        res = super_admin_client.post("/api/v1/admin/build/trigger")
        assert res.status_code == 409
        assert "already in progress" in res.json()["detail"]
    finally:
        state.status = BuildStatus.IDLE.value
        db_session.commit()


def test_build_process_failure_rollback(monkeypatch, db_session):
    from app.api.v1.admin import build
    from app.models.build import SiteBuildState, BuildStatus
    import subprocess

    def fake_run(*args, **kwargs):
        raise RuntimeError("Simulated compilation crash: missing dependency")

    monkeypatch.setattr(subprocess, "run", fake_run)

    build._run_build_process(custom_db=db_session)
    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    assert state.status == BuildStatus.FAILED.value
    assert "Simulated compilation crash" in state.message


def test_rollback_endpoint(super_admin_client: TestClient, db_session, tmp_path, monkeypatch):
    import os
    from app.models.build import SiteBuildState, BuildStatus

    frontend_dir = str(tmp_path / "frontend")
    deploy_dir = os.path.join(frontend_dir, "deploy")
    releases_dir = os.path.join(deploy_dir, "releases")
    r1 = os.path.join(releases_dir, "release_20261119_010000")
    r2 = os.path.join(releases_dir, "release_20261119_020000")
    os.makedirs(r1, exist_ok=True)
    os.makedirs(r2, exist_ok=True)
    with open(os.path.join(r1, "index.html"), "w") as f:
        f.write("release 1")
    with open(os.path.join(r2, "index.html"), "w") as f:
        f.write("release 2")

    current_symlink = os.path.join(deploy_dir, "current")
    os.symlink(os.path.join("releases", "release_20261119_020000"), current_symlink)

    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(id=1, status=BuildStatus.IDLE.value)
        db_session.add(state)
    state.active_release_id = "release_20261119_020000"
    state.previous_release_id = "release_20261119_010000"
    state.status = BuildStatus.SUCCESS.value
    db_session.commit()

    monkeypatch.setattr("app.api.v1.admin.build._find_frontend_dir", lambda: frontend_dir)

    res = super_admin_client.post("/api/v1/admin/build/rollback")
    assert res.status_code == 200
    data = res.json()
    assert data["active_release_id"] == "release_20261119_010000"
    assert os.path.realpath(current_symlink) == os.path.realpath(r1)
