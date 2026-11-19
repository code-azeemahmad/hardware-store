import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.product import Product, StockStatus


def test_list_products_pagination(client_with_seed: TestClient):
    # Default page
    response = client_with_seed.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "total_pages" in data

    assert data["total"] == 11
    assert data["page"] == 1
    assert data["page_size"] == 24
    assert data["total_pages"] == 1
    assert len(data["items"]) == 11

    # Custom page_size
    response_paged = client_with_seed.get("/api/v1/products?page=1&page_size=3")
    assert response_paged.status_code == 200
    paged_data = response_paged.json()
    assert len(paged_data["items"]) == 3
    assert paged_data["total"] == 11
    assert paged_data["total_pages"] == 4


def test_filter_by_search_query(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/products?q=smart")
    assert response.status_code == 200
    data = response.json()
    # Matches DS-681 Smart Door Lock and Floating Bathroom Vanity with Smart LED Mirror and Rimless Smart Toilet
    assert data["total"] >= 1
    slugs = [p["slug"] for p in data["items"]]
    assert "ds-681-smart-door-lock" in slugs

    response_mdf = client_with_seed.get("/api/v1/products?q=mdf")
    assert response_mdf.status_code == 200
    mdf_data = response_mdf.json()
    assert mdf_data["total"] >= 1
    assert any("mdf" in item["slug"] for item in mdf_data["items"])


def test_filter_by_category_parent_and_child(client_with_seed: TestClient):
    # Leaf category
    response_sink = client_with_seed.get("/api/v1/products?category_slug=kitchen-sinks")
    assert response_sink.status_code == 200
    assert response_sink.json()["total"] == 1
    assert response_sink.json()["items"][0]["slug"] == "undermount-double-bowl-kitchen-sink"

    # Parent category (Kitchen - 3 products)
    response_kitchen = client_with_seed.get("/api/v1/products?category_slug=kitchen")
    assert response_kitchen.status_code == 200
    assert response_kitchen.json()["total"] == 3
    kitchen_slugs = [p["slug"] for p in response_kitchen.json()["items"]]
    assert "undermount-double-bowl-kitchen-sink" in kitchen_slugs
    assert "19905-sink-mixer" in kitchen_slugs
    assert "pullout-pantry-storage-unit" in kitchen_slugs

    # Parent category (Bathroom - 3 products across subcategories)
    response_bath = client_with_seed.get("/api/v1/products?category_slug=bathroom")
    assert response_bath.status_code == 200
    assert response_bath.json()["total"] == 3
    bath_slugs = [p["slug"] for p in response_bath.json()["items"]]
    assert "floating-vanity-with-led-mirror" in bath_slugs
    assert "rimless-wall-hung-smart-toilet" in bath_slugs
    assert "thermostatic-digital-piano-shower-system" in bath_slugs

    # Child category (Vanities - 1 product)
    response_vanities = client_with_seed.get("/api/v1/products?category_slug=vanities")
    assert response_vanities.status_code == 200
    assert response_vanities.json()["total"] == 1
    assert response_vanities.json()["items"][0]["slug"] == "floating-vanity-with-led-mirror"


def test_filter_by_brand(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/products?brand_slug=hafele")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    for item in data["items"]:
        assert item["brand_slug"] == "hafele"


def test_filter_by_stock_status(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/products?stock_status=in_stock")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 9
    for item in data["items"]:
        assert item["stock_status"] == "in_stock"


def test_filter_by_flags(client_with_seed: TestClient):
    # Featured
    response_feat = client_with_seed.get("/api/v1/products?is_featured=true")
    assert response_feat.status_code == 200
    assert response_feat.json()["total"] >= 5
    for item in response_feat.json()["items"]:
        assert item["is_featured"] is True

    # Best Seller
    response_best = client_with_seed.get("/api/v1/products?is_best_seller=true")
    assert response_best.status_code == 200
    assert response_best.json()["total"] >= 5
    for item in response_best.json()["items"]:
        assert item["is_best_seller"] is True


def test_sort_by_options(client_with_seed: TestClient):
    # Sort by price_asc
    response_price_asc = client_with_seed.get("/api/v1/products?sort_by=price_asc")
    assert response_price_asc.status_code == 200
    items = response_price_asc.json()["items"]
    priced_items = [float(item["price"]) for item in items if item["price"] is not None]
    assert priced_items == sorted(priced_items)

    # Sort by name_asc
    response_name_asc = client_with_seed.get("/api/v1/products?sort_by=name_asc")
    assert response_name_asc.status_code == 200
    names = [item["name_en"] for item in response_name_asc.json()["items"]]
    assert names == sorted(names)


def test_get_product_detail(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/products/commercial-mdf-sheet-18mm")
    assert response.status_code == 200
    prod = response.json()

    assert prod["slug"] == "commercial-mdf-sheet-18mm"
    assert prod["sku"] == "NP-MDF-18MM"
    assert prod["price_on_request"] is True
    assert prod["stock_status"] == "in_stock"

    # Brand check
    assert prod["brand"]["slug"] == "al-noor"

    # Category check
    category_slugs = [c["slug"] for c in prod["categories"]]
    assert "plywood" in category_slugs
    assert "mdf-sheets" in category_slugs

    # Images check
    assert len(prod["images"]) == 2
    assert prod["images"][0]["is_primary"] is True

    # Specifications JSONB check
    assert isinstance(prod["specifications"], dict)
    assert prod["specifications"]["Thickness"] == "18 mm"
    assert "Standard Sheet Size" in prod["specifications"]

    # Attribute values check
    attr_slugs = [a["attribute_slug"] for a in prod["attribute_values"]]
    assert "material" in attr_slugs
    assert "origin" in attr_slugs
    assert "warranty" in attr_slugs

    # Variants check
    assert len(prod["variants"]) == 3
    variant_skus = [v["sku"] for v in prod["variants"]]
    assert "NP-MDF-12MM" in variant_skus
    assert "NP-MDF-18MM" in variant_skus
    assert "NP-MDF-24MM" in variant_skus

    # Related products check
    assert len(prod["related_products"]) >= 1
    assert prod["related_products"][0]["slug"] == "marine-plywood-bwp-grade"


def test_product_not_found(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/products/non-existent-product-slug")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_unpublished_product_security(client_with_seed: TestClient, seeded_db: Session):
    # Add an unpublished product
    unpub = Product(
        slug="confidential-prototype-product",
        sku="NP-SECRET-001",
        name_en="Confidential Prototype Product",
        name_ur="خفیہ پروڈکٹ",
        price=None,
        price_on_request=True,
        stock_status=StockStatus.ORDER_BASED,
        is_published=False,
    )
    seeded_db.add(unpub)
    seeded_db.commit()

    # 1. Must NOT appear in public listing
    res_list = client_with_seed.get("/api/v1/products")
    assert res_list.status_code == 200
    slugs = [p["slug"] for p in res_list.json()["items"]]
    assert "confidential-prototype-product" not in slugs

    # 2. Must return 404 on direct slug query
    res_direct = client_with_seed.get("/api/v1/products/confidential-prototype-product")
    assert res_direct.status_code == 404
    assert "not found" in res_direct.json()["detail"].lower()


def test_pricing_policy_no_cart_endpoints(client: TestClient):
    # Verify no e-commerce transactional routes exist
    assert client.get("/api/v1/cart").status_code == 404
    assert client.post("/api/v1/checkout").status_code == 404
    assert client.post("/api/v1/orders").status_code == 404
    assert client.post("/api/v1/payment").status_code == 404
