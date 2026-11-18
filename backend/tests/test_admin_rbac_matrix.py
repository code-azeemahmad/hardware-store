import pytest
from starlette.testclient import TestClient


def test_rbac_super_admin_unrestricted_access(super_admin_client: TestClient):
    # Metrics
    assert super_admin_client.get("/api/v1/admin/dashboard/metrics").status_code == 200

    # Invitations
    assert super_admin_client.get("/api/v1/admin/invitations").status_code == 200

    # Rebuild
    assert super_admin_client.post("/api/v1/admin/build/trigger").status_code == 200

    # Enquiries
    assert super_admin_client.get("/api/v1/admin/enquiries").status_code == 200

    # Categories
    assert super_admin_client.get("/api/v1/admin/categories").status_code == 200


def test_rbac_standard_admin_restrictions(standard_admin_client: TestClient):
    # Standard admin can manage categories, brands, products, enquiries
    assert standard_admin_client.get("/api/v1/admin/dashboard/metrics").status_code == 200
    assert standard_admin_client.get("/api/v1/admin/categories").status_code == 200
    assert standard_admin_client.get("/api/v1/admin/brands").status_code == 200
    assert standard_admin_client.get("/api/v1/admin/products").status_code == 200
    assert standard_admin_client.get("/api/v1/admin/enquiries").status_code == 200

    # But standard admin CANNOT manage staff invitations (super_admin only)
    assert standard_admin_client.get("/api/v1/admin/invitations").status_code == 403
    assert standard_admin_client.post(
        "/api/v1/admin/invitations",
        json={"email": "hacker@example.com", "role": "admin"},
    ).status_code == 403

    # And standard admin CANNOT trigger site rebuilds (super_admin only)
    assert standard_admin_client.post("/api/v1/admin/build/trigger").status_code == 403


def test_rbac_catalogue_editor_restrictions(editor_client: TestClient, super_admin_client: TestClient):
    # Editor can view metrics, categories, brands, products
    assert editor_client.get("/api/v1/admin/dashboard/metrics").status_code == 200
    assert editor_client.get("/api/v1/admin/categories").status_code == 200
    assert editor_client.get("/api/v1/admin/brands").status_code == 200
    assert editor_client.get("/api/v1/admin/products").status_code == 200

    # Editor CANNOT access customer inquiries
    assert editor_client.get("/api/v1/admin/enquiries").status_code == 403

    # Editor CANNOT manage staff invitations
    assert editor_client.get("/api/v1/admin/invitations").status_code == 403

    # Editor CANNOT trigger rebuilds
    assert editor_client.post("/api/v1/admin/build/trigger").status_code == 403

    # Create dummy items using super_admin to test delete restrictions
    cat_id = super_admin_client.post(
        "/api/v1/admin/categories",
        json={"slug": "cat-editor-del-test", "name_en": "Cat", "name_ur": "کیٹ"},
    ).json()["id"]

    brand_id = super_admin_client.post(
        "/api/v1/admin/brands",
        json={"slug": "brand-editor-del-test", "name": "Brand"},
    ).json()["id"]

    prod_id = super_admin_client.post(
        "/api/v1/admin/products",
        json={"slug": "prod-editor-del-test", "sku": "SKU-ED-001", "name_en": "Prod", "name_ur": "پراڈکٹ"},
    ).json()["id"]

    # Editor CANNOT delete categories, brands, or products
    assert editor_client.delete(f"/api/v1/admin/categories/{cat_id}").status_code == 403
    assert editor_client.delete(f"/api/v1/admin/brands/{brand_id}").status_code == 403
    assert editor_client.delete(f"/api/v1/admin/products/{prod_id}").status_code == 403


def test_rbac_enquiry_handler_restrictions(enquiry_handler_client: TestClient):
    # Enquiry handler can view metrics and manage inquiries
    assert enquiry_handler_client.get("/api/v1/admin/dashboard/metrics").status_code == 200
    assert enquiry_handler_client.get("/api/v1/admin/enquiries").status_code == 200

    # Enquiry handler CANNOT list, create or modify categories, brands, or products
    assert enquiry_handler_client.get("/api/v1/admin/categories").status_code == 403
    assert enquiry_handler_client.get("/api/v1/admin/brands").status_code == 403
    assert enquiry_handler_client.get("/api/v1/admin/products").status_code == 403

    # Enquiry handler CANNOT upload media
    fake_png = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    assert enquiry_handler_client.post(
        "/api/v1/admin/media/upload",
        files={"file": ("test.png", fake_png, "image/png")},
    ).status_code == 403

    # Enquiry handler CANNOT manage invitations or trigger rebuild
    assert enquiry_handler_client.get("/api/v1/admin/invitations").status_code == 403
    assert enquiry_handler_client.post("/api/v1/admin/build/trigger").status_code == 403
