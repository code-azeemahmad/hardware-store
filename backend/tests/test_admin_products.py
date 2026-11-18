import pytest
from starlette.testclient import TestClient


def test_list_admin_products_unauthorized(client: TestClient):
    res = client.get("/api/v1/admin/products")
    assert res.status_code == 401


def test_admin_product_full_crud_lifecycle(super_admin_client: TestClient):
    # 1. Create a category and brand for product associations
    cat_res = super_admin_client.post(
        "/api/v1/admin/categories",
        json={"slug": "cat-for-prod", "name_en": "Hardware Category", "name_ur": "ہارڈویئر کیٹیگری"},
    )
    cat_id = cat_res.json()["id"]

    brand_res = super_admin_client.post(
        "/api/v1/admin/brands",
        json={"slug": "brand-for-prod", "name": "Brand Hardware", "description_en": "Brand description"},
    )
    brand_id = brand_res.json()["id"]

    # 2. Create product
    payload = {
        "slug": "admin-test-hinge",
        "sku": "SKU-ADM-001",
        "name_en": "Hydraulic Soft Close Hinge",
        "name_ur": "ہائیڈرولک سافٹ کلوز قبضہ",
        "short_description_en": "Clip-on 3D adjustable concealed cabinet hinge.",
        "short_description_ur": "الماری کا ہائیڈرولک قبضہ",
        "description_en": "Full description of cabinet hinge.",
        "description_ur": "مکمل تفصیل",
        "price": None,
        "price_on_request": True,
        "stock_status": "in_stock",
        "specifications": {"Opening Angle": "110°", "Cup Depth": "11.5mm"},
        "is_published": True,
        "is_featured": True,
        "is_best_seller": False,
        "meta_title_en": "Hydraulic Soft Close Hinge",
        "meta_title_ur": "ہائیڈرولک سافٹ کلوز قبضہ",
        "meta_description_en": "Best cabinet hinges in Sargodha.",
        "meta_description_ur": "سرگودھا میں بہترین ہارڈویئر",
        "brand_id": brand_id,
        "category_ids": [cat_id],
        "images": [
            {
                "image_url": "/media/hinge_front.webp",
                "alt_text_en": "Front view of hinge",
                "alt_text_ur": "سامنے کا منظر",
                "is_primary": True,
                "sort_order": 0,
            }
        ],
        "attributes": [],
        "variants": [
            {
                "sku": "SKU-ADM-001-FULL",
                "name_en": "Full Overlay",
                "name_ur": "فل اوورلے",
                "price": None,
                "stock_status": "in_stock",
            }
        ],
    }

    create_res = super_admin_client.post("/api/v1/admin/products", json=payload)
    assert create_res.status_code == 201
    prod = create_res.json()
    prod_id = prod["id"]
    assert prod["slug"] == "admin-test-hinge"
    assert prod["specifications"]["Opening Angle"] == "110°"
    assert len(prod["images"]) == 1
    assert len(prod["variants"]) == 1

    # 3. Get product detail
    get_res = super_admin_client.get(f"/api/v1/admin/products/{prod_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name_en"] == "Hydraulic Soft Close Hinge"

    # 4. Update product fields
    update_res = super_admin_client.put(
        f"/api/v1/admin/products/{prod_id}",
        json={"name_en": "Premium Hydraulic Soft Close Hinge", "is_featured": False},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name_en"] == "Premium Hydraulic Soft Close Hinge"
    assert update_res.json()["is_featured"] is False

    # 5. Add extra image
    img_res = super_admin_client.post(
        f"/api/v1/admin/products/{prod_id}/images",
        json={
            "image_url": "/media/hinge_side.webp",
            "alt_text_en": "Side view",
            "alt_text_ur": "سائیڈ منظر",
            "is_primary": False,
            "sort_order": 1,
        },
    )
    assert img_res.status_code == 201
    new_img_id = img_res.json()["id"]

    # 6. Remove extra image
    del_img_res = super_admin_client.delete(f"/api/v1/admin/products/{prod_id}/images/{new_img_id}")
    assert del_img_res.status_code == 200

    # 7. Add extra variant
    var_res = super_admin_client.post(
        f"/api/v1/admin/products/{prod_id}/variants",
        json={
            "sku": "SKU-ADM-001-HALF",
            "name_en": "Half Overlay",
            "name_ur": "ہاف اوورلے",
            "stock_status": "in_stock",
        },
    )
    assert var_res.status_code == 201
    new_var_id = var_res.json()["id"]

    # 8. Remove extra variant
    del_var_res = super_admin_client.delete(f"/api/v1/admin/products/{prod_id}/variants/{new_var_id}")
    assert del_var_res.status_code == 200

    # 9. Delete product
    del_prod_res = super_admin_client.delete(f"/api/v1/admin/products/{prod_id}")
    assert del_prod_res.status_code == 200

    # 10. Verify 404
    get_again = super_admin_client.get(f"/api/v1/admin/products/{prod_id}")
    assert get_again.status_code == 404


def test_product_translation_filter(super_admin_client: TestClient):
    # Product complete
    super_admin_client.post(
        "/api/v1/admin/products",
        json={
            "slug": "prod-trans-complete",
            "sku": "SKU-TC-01",
            "name_en": "Complete Hinge",
            "name_ur": "مکمل قبضہ",
            "short_description_en": "English short description",
            "short_description_ur": "اردو مختصر تفصیل",
            "is_published": True,
        },
    )

    # Product missing Urdu
    super_admin_client.post(
        "/api/v1/admin/products",
        json={
            "slug": "prod-trans-missing-ur",
            "sku": "SKU-TM-02",
            "name_en": "English Only Screws",
            "name_ur": "",
            "short_description_en": "Description in English",
            "short_description_ur": "",
            "is_published": True,
        },
    )

    # Filter complete
    res_c = super_admin_client.get("/api/v1/admin/products?translation_status=complete")
    assert res_c.status_code == 200
    slugs_c = [p["slug"] for p in res_c.json()["items"]]
    assert "prod-trans-complete" in slugs_c
    assert "prod-trans-missing-ur" not in slugs_c

    # Filter missing_ur
    res_m = super_admin_client.get("/api/v1/admin/products?translation_status=missing_ur")
    assert res_m.status_code == 200
    slugs_m = [p["slug"] for p in res_m.json()["items"]]
    assert "prod-trans-missing-ur" in slugs_m
    assert "prod-trans-complete" not in slugs_m


def test_editor_cannot_delete_product(editor_client: TestClient, super_admin_client: TestClient):
    create_res = super_admin_client.post(
        "/api/v1/admin/products",
        json={
            "slug": "prod-editor-no-del",
            "sku": "SKU-ED-01",
            "name_en": "Protected Product",
            "name_ur": "محفوظ پراڈکٹ",
            "is_published": True,
        },
    )
    prod_id = create_res.json()["id"]

    del_res = editor_client.delete(f"/api/v1/admin/products/{prod_id}")
    assert del_res.status_code == 403
