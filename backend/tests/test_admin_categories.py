import pytest
from starlette.testclient import TestClient


def test_list_admin_categories_unauthorized(client: TestClient):
    res = client.get("/api/v1/admin/categories")
    assert res.status_code == 401


def test_admin_category_crud_flow(super_admin_client: TestClient):
    # 1. Create a category
    payload = {
        "slug": "test-hardware-cat",
        "name_en": "Test Hardware Category",
        "name_ur": "ٹیسٹ ہارڈویئر کیٹیگری",
        "description_en": "English category description",
        "description_ur": "اردو تفصیل",
        "sort_order": 5,
        "is_published": True,
    }
    create_res = super_admin_client.post("/api/v1/admin/categories", json=payload)
    assert create_res.status_code == 201
    cat_data = create_res.json()
    cat_id = cat_data["id"]
    assert cat_data["slug"] == "test-hardware-cat"
    assert cat_data["translation_status"] == "complete"

    # 2. Get category detail
    get_res = super_admin_client.get(f"/api/v1/admin/categories/{cat_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name_en"] == "Test Hardware Category"

    # 3. Update category
    update_res = super_admin_client.put(
        f"/api/v1/admin/categories/{cat_id}",
        json={"name_en": "Updated Hardware Category"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name_en"] == "Updated Hardware Category"

    # 4. Toggle publish status
    toggle_res = super_admin_client.patch(
        f"/api/v1/admin/categories/{cat_id}/publish?is_published=false"
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_published"] is False

    # 5. Delete category
    del_res = super_admin_client.delete(f"/api/v1/admin/categories/{cat_id}")
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Category deleted successfully"

    # 6. Verify 404 after deletion
    get_again = super_admin_client.get(f"/api/v1/admin/categories/{cat_id}")
    assert get_again.status_code == 404


def test_category_translation_status_filter(super_admin_client: TestClient):
    # Create complete category
    super_admin_client.post(
        "/api/v1/admin/categories",
        json={
            "slug": "complete-cat",
            "name_en": "Complete Category",
            "name_ur": "مکمل کیٹیگری",
            "is_published": True,
        },
    )

    # Create category missing Urdu
    super_admin_client.post(
        "/api/v1/admin/categories",
        json={
            "slug": "missing-ur-cat",
            "name_en": "English Only Category",
            "name_ur": "",
            "is_published": True,
        },
    )

    # Filter complete
    res_complete = super_admin_client.get(
        "/api/v1/admin/categories?translation_status=complete"
    )
    assert res_complete.status_code == 200
    slugs_complete = [c["slug"] for c in res_complete.json()]
    assert "complete-cat" in slugs_complete
    assert "missing-ur-cat" not in slugs_complete

    # Filter missing_ur
    res_missing = super_admin_client.get(
        "/api/v1/admin/categories?translation_status=missing_ur"
    )
    assert res_missing.status_code == 200
    slugs_missing = [c["slug"] for c in res_missing.json()]
    assert "missing-ur-cat" in slugs_missing
    assert "complete-cat" not in slugs_missing


def test_editor_cannot_delete_category(editor_client: TestClient, super_admin_client: TestClient):
    # Super admin creates category
    create_res = super_admin_client.post(
        "/api/v1/admin/categories",
        json={
            "slug": "protected-cat",
            "name_en": "Protected Category",
            "name_ur": "محفوظ کیٹیگری",
            "is_published": True,
        },
    )
    cat_id = create_res.json()["id"]

    # Editor tries to delete -> 403 Forbidden
    del_res = editor_client.delete(f"/api/v1/admin/categories/{cat_id}")
    assert del_res.status_code == 403
