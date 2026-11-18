from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Brand, Product
from app.schemas.product import BrandRead, ProductListItem, ProductCategorySnippet

router = APIRouter(prefix="/brands", tags=["brands"])


@router.get("", response_model=List[BrandRead])
def list_brands(db: Session = Depends(get_db)):
    """Retrieve published brands with product counts."""
    brands = (
        db.query(Brand)
        .filter(Brand.is_published.is_(True))
        .order_by(Brand.sort_order.asc(), Brand.name.asc())
        .all()
    )

    # Get product counts per brand
    counts_query = (
        db.query(Product.brand_id, func.count(Product.id))
        .filter(Product.is_published.is_(True), Product.brand_id.isnot(None))
        .group_by(Product.brand_id)
        .all()
    )
    counts_map = {brand_id: count for brand_id, count in counts_query}

    results = []
    for b in brands:
        item = BrandRead(
            id=b.id,
            slug=b.slug,
            name=b.name,
            logo_url=b.logo_url,
            description_en=b.description_en,
            description_ur=b.description_ur,
            website_url=b.website_url,
            sort_order=b.sort_order,
            is_published=b.is_published,
            product_count=counts_map.get(b.id, 0),
        )
        results.append(item)

    return results


@router.get("/{slug}", response_model=BrandRead)
def get_brand(slug: str, db: Session = Depends(get_db)):
    """Retrieve single brand details by slug."""
    brand = (
        db.query(Brand)
        .filter(Brand.slug == slug, Brand.is_published.is_(True))
        .first()
    )
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand '{slug}' not found",
        )

    product_count = (
        db.query(Product)
        .filter(Product.brand_id == brand.id, Product.is_published.is_(True))
        .count()
    )

    return BrandRead(
        id=brand.id,
        slug=brand.slug,
        name=brand.name,
        logo_url=brand.logo_url,
        description_en=brand.description_en,
        description_ur=brand.description_ur,
        website_url=brand.website_url,
        sort_order=brand.sort_order,
        is_published=brand.is_published,
        product_count=product_count,
    )
