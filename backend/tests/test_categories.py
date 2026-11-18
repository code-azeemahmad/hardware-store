import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.category import Category


def test_list_categories_empty(client: TestClient):
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    assert response.json() == []


def test_list_categories_seeded(client_with_seed: TestClient):
    # Test root_only=True (default) - All 4 main root categories
    response = client_with_seed.get("/api/v1/categories?root_only=true")
    assert response.status_code == 200
    roots = response.json()
    assert len(roots) == 4
    root_slugs = [c["slug"] for c in roots]
    assert "kitchen" in root_slugs
    assert "hardware" in root_slugs
    assert "bathroom" in root_slugs
    assert "plywood" in root_slugs

    # Test root_only=False (all categories including subcategories)
    response_all = client_with_seed.get("/api/v1/categories?root_only=false")
    assert response_all.status_code == 200
    all_cats = response_all.json()
    assert len(all_cats) == 19
    all_slugs = [c["slug"] for c in all_cats]
    assert "kitchen-sinks" in all_slugs
    assert "marine-plywood" in all_slugs
    assert "vanities" in all_slugs
    assert "commodes" in all_slugs
    assert "showers" in all_slugs


def test_category_tree(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/categories/tree")
    assert response.status_code == 200
    tree = response.json()
    assert isinstance(tree, list)
    assert len(tree) == 4

    # Check that kitchen has children
    kitchen = next((c for c in tree if c["slug"] == "kitchen"), None)
    assert kitchen is not None
    assert len(kitchen["children"]) == 3

    # Check that bathroom has 6 children
    bathroom = next((c for c in tree if c["slug"] == "bathroom"), None)
    assert bathroom is not None
    assert len(bathroom["children"]) == 6
    bathroom_child_slugs = [c["slug"] for c in bathroom["children"]]
    assert "vanities" in bathroom_child_slugs
    assert "commodes" in bathroom_child_slugs
    assert "showers" in bathroom_child_slugs
    assert "basins" in bathroom_child_slugs


def test_get_category_detail(client_with_seed: TestClient):
    # Root category detail - Bathroom
    response_bath = client_with_seed.get("/api/v1/categories/bathroom")
    assert response_bath.status_code == 200
    data_bath = response_bath.json()
    assert data_bath["slug"] == "bathroom"
    assert data_bath["name_en"] == "Bathroom"
    assert data_bath["name_ur"] == "باتھ روم"
    assert data_bath["parent"] is None
    assert len(data_bath["children"]) == 6
    assert data_bath["product_count"] == 3

    # Child category detail - Vanities
    response_child = client_with_seed.get("/api/v1/categories/vanities")
    assert response_child.status_code == 200
    child_data = response_child.json()
    assert child_data["slug"] == "vanities"
    assert child_data["parent"] is not None
    assert child_data["parent"]["slug"] == "bathroom"
    assert child_data["product_count"] == 1


def test_category_not_found(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/categories/non-existent-slug-xyz")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_unpublished_category_security(client_with_seed: TestClient, seeded_db: Session):
    # Create an unpublished category
    unpub = Category(
        slug="secret-internal-category",
        name_en="Secret Internal Category",
        name_ur="خفیہ کیٹیگری",
        is_published=False,
    )
    seeded_db.add(unpub)
    seeded_db.commit()

    # Verify not returned in public category list
    res_list = client_with_seed.get("/api/v1/categories?root_only=false")
    assert res_list.status_code == 200
    slugs = [c["slug"] for c in res_list.json()]
    assert "secret-internal-category" not in slugs

    # Verify 404 on direct slug request
    res_direct = client_with_seed.get("/api/v1/categories/secret-internal-category")
    assert res_direct.status_code == 404
