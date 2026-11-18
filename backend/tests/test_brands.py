import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.product import Brand


def test_list_brands_empty(client: TestClient):
    response = client.get("/api/v1/brands")
    assert response.status_code == 200
    assert response.json() == []


def test_list_brands_seeded(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/brands")
    assert response.status_code == 200
    brands = response.json()
    assert len(brands) == 6

    slugs = [b["slug"] for b in brands]
    assert "hafele" in slugs
    assert "blum" in slugs
    assert "diamond-supreme" in slugs
    assert "al-noor" in slugs
    assert "master-sanitary" in slugs

    # Verify product_count is populated
    hafele = next((b for b in brands if b["slug"] == "hafele"), None)
    assert hafele is not None
    assert hafele["product_count"] >= 2


def test_get_brand_by_slug(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/brands/hafele")
    assert response.status_code == 200
    brand = response.json()
    assert brand["slug"] == "hafele"
    assert brand["name"] == "Häfele"
    assert "architectural hardware" in brand["description_en"].lower()
    assert brand["product_count"] >= 2


def test_brand_not_found(client_with_seed: TestClient):
    response = client_with_seed.get("/api/v1/brands/non-existent-brand")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_unpublished_brand_security(client_with_seed: TestClient, seeded_db: Session):
    # Add an unpublished brand
    unpub = Brand(
        slug="unverified-experimental-brand",
        name="Unverified Brand",
        is_published=False,
    )
    seeded_db.add(unpub)
    seeded_db.commit()

    # 1. Must NOT appear in public listing
    res_list = client_with_seed.get("/api/v1/brands")
    assert res_list.status_code == 200
    slugs = [b["slug"] for b in res_list.json()]
    assert "unverified-experimental-brand" not in slugs

    # 2. Must return 404 on direct slug query
    res_direct = client_with_seed.get("/api/v1/brands/unverified-experimental-brand")
    assert res_direct.status_code == 404
    assert "not found" in res_direct.json()["detail"].lower()
