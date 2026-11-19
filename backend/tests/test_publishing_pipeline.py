import os
import shutil
import subprocess
from datetime import datetime, timezone
import pytest
from starlette.testclient import TestClient

from app.api.v1.admin import build
from app.models.build import BuildStatus, SiteBuildState
from app.models.category import Category
from app.models.product import Brand, Product, StockStatus
from app.models.user import AdminRole, AdminUser
from app.core.security import create_access_token


def test_build_export_endpoint(client_with_seed: TestClient):
    """Verify /api/v1/products/build-export returns all published products in a single call."""
    res = client_with_seed.get("/api/v1/products/build-export")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 11  # seeded products
    for item in data:
        assert item["is_published"] is True
        assert "slug" in item
        assert "name_en" in item
        assert "categories" in item
        assert "images" in item
        assert "attribute_values" in item


def test_pagination_with_more_than_100_products(db_session, client: TestClient):
    """Verify pagination loop retrieves all items when published products exceed 100."""
    # Create a category and brand
    cat = Category(
        slug="pagination-test-cat",
        name_en="Pagination Cat",
        name_ur="ٹیسٹ کیٹلاگ",
        is_published=True,
    )
    brand = Brand(
        slug="pagination-test-brand",
        name="Pagination Brand",
        is_published=True,
    )
    db_session.add_all([cat, brand])
    db_session.commit()

    # Create 105 published products
    products = [
        Product(
            slug=f"bulk-test-prod-{i}",
            sku=f"BULK-{i:04d}",
            name_en=f"Bulk Product {i}",
            name_ur=f"پروڈکٹ {i}",
            price_on_request=True,
            stock_status=StockStatus.IN_STOCK,
            is_published=True,
            brand_id=brand.id,
        )
        for i in range(1, 106)
    ]
    for p in products:
        p.categories.append(cat)
    db_session.add_all(products)
    db_session.commit()

    # 1. Verify build-export endpoint retrieves all 105 products
    export_res = client.get("/api/v1/products/build-export")
    assert export_res.status_code == 200
    export_items = export_res.json()
    assert len(export_items) >= 105

    # 2. Verify paginated retrieval fetches page 1 and page 2 completely
    p1_res = client.get("/api/v1/products?page=1&page_size=100")
    assert p1_res.status_code == 200
    p1_data = p1_res.json()
    assert p1_data["total"] >= 105
    assert len(p1_data["items"]) == 100
    assert p1_data["total_pages"] >= 2

    p2_res = client.get("/api/v1/products?page=2&page_size=100")
    assert p2_res.status_code == 200
    p2_data = p2_res.json()
    assert len(p2_data["items"]) >= 5


def test_strict_production_build_failure_on_api_error(monkeypatch, db_session, tmp_path):
    """Verify that build fails strictly and preserves existing website when compilation or API fails."""
    frontend_dir = str(tmp_path / "frontend")
    deploy_dir = os.path.join(frontend_dir, "deploy")
    releases_dir = os.path.join(deploy_dir, "releases")
    init_release = os.path.join(releases_dir, "release_initial")
    os.makedirs(init_release, exist_ok=True)
    with open(os.path.join(init_release, "index.html"), "w") as f:
        f.write("Initial Live Website - Untouched")

    current_symlink = os.path.join(deploy_dir, "current")
    os.symlink(os.path.join("releases", "release_initial"), current_symlink)

    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(id=1, status=BuildStatus.IDLE.value)
        db_session.add(state)
    state.active_release_id = "release_initial"
    state.status = BuildStatus.SUCCESS.value
    db_session.commit()

    # Simulate compilation failure (e.g. strict API threw an error)
    def fake_subprocess_run(cmd, *args, **kwargs):
        class MockProc:
            returncode = 1
            stderr = "[Astro SSG STRICT] Backend API unreachable. Fixture fallback is disabled in production."
            stdout = ""
        return MockProc()

    monkeypatch.setattr(subprocess, "run", fake_subprocess_run)
    monkeypatch.setattr("app.api.v1.admin.build._find_frontend_dir", lambda: frontend_dir)

    build._run_build_process(custom_db=db_session)

    # State must be failed
    db_session.refresh(state)
    assert state.status == BuildStatus.FAILED.value
    assert "Astro SSG STRICT" in state.message

    # Active pointer must remain untouched pointing to initial release
    assert os.path.realpath(current_symlink) == os.path.realpath(init_release)
    with open(current_symlink + "/index.html") as f:
        assert f.read() == "Initial Live Website - Untouched"


def test_atomic_deployment_and_release_pointer_swap(monkeypatch, db_session, tmp_path):
    """Verify that a successful build creates a new release and atomically updates current symlink."""
    frontend_dir = str(tmp_path / "frontend")
    deploy_dir = os.path.join(frontend_dir, "deploy")
    releases_dir = os.path.join(deploy_dir, "releases")
    r0 = os.path.join(releases_dir, "release_0")
    os.makedirs(r0, exist_ok=True)
    with open(os.path.join(r0, "index.html"), "w") as f:
        f.write("Version 0")

    current_symlink = os.path.join(deploy_dir, "current")
    os.symlink(os.path.join("releases", "release_0"), current_symlink)

    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(id=1, status=BuildStatus.IDLE.value)
        db_session.add(state)
    state.active_release_id = "release_0"
    db_session.commit()

    def fake_subprocess_run(cmd, *args, **kwargs):
        # Write verified files to the output dir
        out_rel = cmd[cmd.index("--outDir") + 1]
        out_abs = os.path.join(frontend_dir, out_rel)
        os.makedirs(out_abs, exist_ok=True)
        os.makedirs(os.path.join(out_abs, "ur"), exist_ok=True)
        with open(os.path.join(out_abs, "index.html"), "w") as f:
            f.write("Version 1 (New)")
        with open(os.path.join(out_abs, "ur", "index.html"), "w") as f:
            f.write("ورژن 1 (نیا)")
        with open(os.path.join(out_abs, "sitemap.xml"), "w") as f:
            f.write("<urlset></urlset>")

        class MockProc:
            returncode = 0
            stderr = ""
            stdout = "Build successful"
        return MockProc()

    monkeypatch.setattr(subprocess, "run", fake_subprocess_run)
    monkeypatch.setattr("app.api.v1.admin.build._find_frontend_dir", lambda: frontend_dir)

    build._run_build_process(custom_db=db_session)

    db_session.refresh(state)
    assert state.status == BuildStatus.SUCCESS.value
    assert state.previous_release_id == "release_0"
    assert state.active_release_id.startswith("release_")

    # Current symlink must point to the new release
    with open(current_symlink + "/index.html") as f:
        assert f.read() == "Version 1 (New)"


def test_startup_recovery_of_stale_build_state(db_session):
    """Verify that server startup resets stale 'building' state left from a sudden crash/restart."""
    from app.main import _recover_stale_build_state

    state = db_session.query(SiteBuildState).filter(SiteBuildState.id == 1).first()
    if not state:
        state = SiteBuildState(id=1, status=BuildStatus.IDLE.value)
        db_session.add(state)
    state.status = BuildStatus.BUILDING.value
    state.message = "Stale build in progress..."
    db_session.commit()

    _recover_stale_build_state(custom_db=db_session)

    db_session.refresh(state)
    assert state.status == BuildStatus.FAILED.value
    assert "interrupted by server restart" in state.message


def test_sanitize_error_removes_secrets():
    """Verify error sanitization strips DB passwords, secret keys, and auth tokens."""
    sensitive_msg = (
        "Connection error: postgresql+psycopg://hardware_user:super_secret_password_123@"
        "hardware-postgres:5432/hardware_db failed. SECRET_KEY=jwt_super_secret_key_456"
    )
    cleaned = build._sanitize_error(sensitive_msg)
    assert "super_secret_password_123" not in cleaned
    assert "jwt_super_secret_key_456" not in cleaned
    assert "[REDACTED_PASSWORD]" in cleaned
    assert "SECRET_KEY=[REDACTED]" in cleaned


def test_unpublished_product_returns_404_and_excluded_from_export(db_session, client: TestClient):
    """Verify unpublished products cannot be retrieved publicly or included in build export."""
    unpub = Product(
        slug="unpublished-secret-drill",
        sku="UNPUB-001",
        name_en="Secret Unpublished Drill",
        name_ur="خفیہ ڈرل ٹیسٹ",
        price_on_request=True,
        stock_status=StockStatus.IN_STOCK,
        is_published=False,
    )
    db_session.add(unpub)
    db_session.commit()

    # 1. Direct slug retrieval must 404
    res = client.get(f"/api/v1/products/{unpub.slug}")
    assert res.status_code == 404

    # 2. Must not be in public list
    list_res = client.get("/api/v1/products")
    assert list_res.status_code == 200
    slugs = [p["slug"] for p in list_res.json()["items"]]
    assert unpub.slug not in slugs

    # 3. Must not be in build-export
    export_res = client.get("/api/v1/products/build-export")
    assert export_res.status_code == 200
    export_slugs = [p["slug"] for p in export_res.json()]
    assert unpub.slug not in export_slugs
