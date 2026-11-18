import pytest
from starlette.testclient import TestClient


def test_list_admin_brands_unauthorized(client: TestClient):
    res = client.get("/api/v1/admin/brands")
    assert res.status_code == 401


def test_admin_brand_crud_flow(super_admin_client: TestClient):
    # 1. Create brand
    payload = {
        "slug": "test-brand-admin",
        "name": "Test Brand Admin",
        "description_en": "High quality hardware brand",
        "description_ur": "اعلیٰ معیار کا ہارڈویئر برانڈ",
        "sort_order": 1,
        "is_published": True,
    }
    create_res = super_admin_client.post("/api/v1/admin/brands", json=payload)
    assert create_res.status_code == 201
    brand = create_res.json()
    brand_id = brand["id"]
    assert brand["slug"] == "test-brand-admin"
    assert brand["translation_status"] == "complete"

    # 2. Get brand
    get_res = super_admin_client.get(f"/api/v1/admin/brands/{brand_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Test Brand Admin"

    # 3. Update brand
    update_res = super_admin_client.put(
        f"/api/v1/admin/brands/{brand_id}",
        json={"name": "Updated Brand Admin"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Brand Admin"

    # 4. Toggle publish
    toggle_res = super_admin_client.patch(
        f"/api/v1/admin/brands/{brand_id}/publish?is_published=false"
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_published"] is False

    # 5. Delete brand
    del_res = super_admin_client.delete(f"/api/v1/admin/brands/{brand_id}")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Brand deleted successfully"

    # 6. Verify 404
    get_again = super_admin_client.get(f"/api/v1/admin/brands/{brand_id}")
    assert get_again.status_code == 404


def test_brand_translation_status_filter(super_admin_client: TestClient):
    # Complete brand
    super_admin_client.post(
        "/api/v1/admin/brands",
        json={
            "slug": "brand-complete",
            "name": "Complete Brand",
            "description_en": "Desc in English",
            "description_ur": "اردو تفصیل",
            "is_published": True,
        },
    )

    # Missing Urdu description brand
    super_admin_client.post(
        "/api/v1/admin/brands",
        json={
            "slug": "brand-missing-ur",
            "name": "Missing UR Brand",
            "description_en": "Only English description",
            "description_ur": "",
            "is_published": True,
        },
    )

    # Filter complete
    res_c = super_admin_client.get("/api/v1/admin/brands?translation_status=complete")
    assert res_c.status_code == 200
    slugs_c = [b["slug"] for b in res_c.json()]
    assert "brand-complete" in slugs_c
    assert "brand-missing-ur" not in slugs_c

    # Filter missing_ur
    res_m = super_admin_client.get("/api/v1/admin/brands?translation_status=missing_ur")
    assert res_m.status_code == 200
    slugs_m = [b["slug"] for b in res_m.json()]
    assert "brand-missing-ur" in slugs_m
    assert "brand-complete" not in slugs_m


def test_editor_cannot_delete_brand(editor_client: TestClient, super_admin_client: TestClient):
    create_res = super_admin_client.post(
        "/api/v1/admin/brands",
        json={
            "slug": "protected-brand",
            "name": "Protected Brand",
            "description_en": "Description",
            "is_published": True,
        },
    )
    brand_id = create_res.json()["id"]

    del_res = editor_client.delete(f"/api/v1/admin/brands/{brand_id}")
    assert del_res.status_code == 403
