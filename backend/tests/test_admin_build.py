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
