import math
import uuid
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session, joinedload, selectinload

from app.db.session import get_db
from app.models.category import Category
from app.models.product import (
    Brand,
    Product,
    ProductAttributeValue,
    ProductImage,
    ProductVariant,
    StockStatus,
)
from app.schemas.common import PaginatedResponse
from app.schemas.product import (
    BrandRead,
    ProductAttributeValueRead,
    ProductCategorySnippet,
    ProductDetail,
    ProductImageRead,
    ProductListItem,
    ProductVariantRead,
)

router = APIRouter(prefix="/products", tags=["products"])


def _to_list_item(p: Product) -> ProductListItem:
    """Helper to convert Product model to ProductListItem schema."""
    primary_img = None
    if p.images:
        # Find image marked is_primary, or first image
        for img in p.images:
            if img.is_primary:
                primary_img = img
                break
        if not primary_img and p.images:
            primary_img = p.images[0]

    return ProductListItem(
        id=p.id,
        slug=p.slug,
        sku=p.sku,
        name_en=p.name_en,
        name_ur=p.name_ur,
        short_description_en=p.short_description_en,
        short_description_ur=p.short_description_ur,
        price=p.price,
        price_on_request=p.price_on_request,
        stock_status=p.stock_status,
        is_featured=p.is_featured,
        is_best_seller=p.is_best_seller,
        brand_name=p.brand.name if p.brand else None,
        brand_slug=p.brand.slug if p.brand else None,
        primary_image_url=primary_img.image_url if primary_img else None,
        primary_image_alt_en=primary_img.alt_text_en if primary_img else None,
        primary_image_alt_ur=primary_img.alt_text_ur if primary_img else None,
        categories=[
            ProductCategorySnippet(id=c.id, slug=c.slug, name_en=c.name_en, name_ur=c.name_ur)
            for c in p.categories
        ],
    )


@router.get("", response_model=PaginatedResponse[ProductListItem])
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(24, ge=1, le=100, description="Items per page"),
    q: Optional[str] = Query(None, min_length=1, max_length=100, description="Search keyword"),
    category_slug: Optional[str] = Query(None, description="Filter by category or subcategory slug"),
    brand_slug: Optional[str] = Query(None, description="Filter by brand slug"),
    is_featured: Optional[bool] = Query(None, description="Filter featured items"),
    is_best_seller: Optional[bool] = Query(None, description="Filter best selling items"),
    price_on_request: Optional[bool] = Query(None, description="Filter price on request"),
    stock_status: Optional[StockStatus] = Query(None, description="Filter stock status"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price filter"),
    sort_by: Optional[str] = Query("newest", description="Sorting: newest, oldest, name_asc, name_desc, price_asc, price_desc"),
    db: Session = Depends(get_db),
):
    """List published products with search, multi-faceted filtering, sorting, and pagination."""
    query = (
        db.query(Product)
        .options(
            joinedload(Product.brand),
            selectinload(Product.categories),
            selectinload(Product.images),
        )
        .filter(Product.is_published.is_(True))
    )

    # 1. Search Query Filter
    if q:
        search_term = f"%{q.strip()}%"
        query = query.join(Product.brand, isouter=True).filter(
            or_(
                Product.name_en.ilike(search_term),
                Product.name_ur.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.short_description_en.ilike(search_term),
                Product.short_description_ur.ilike(search_term),
                Product.description_en.ilike(search_term),
                Product.description_ur.ilike(search_term),
                Brand.name.ilike(search_term),
            )
        )

    # 2. Category Filter (including subcategories)
    if category_slug:
        target_category = db.query(Category).filter(Category.slug == category_slug).first()
        if target_category:
            # Find all descendant category IDs
            descendant_ids = [target_category.id]
            children = db.query(Category.id).filter(Category.parent_id == target_category.id).all()
            descendant_ids.extend([c[0] for c in children])
            query = query.filter(Product.categories.any(Category.id.in_(descendant_ids)))
        else:
            query = query.filter(Product.categories.any(Category.slug == category_slug))

    # 3. Brand Filter
    if brand_slug:
        query = query.filter(Product.brand.has(slug=brand_slug))

    # 4. Flags
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_best_seller is not None:
        query = query.filter(Product.is_best_seller == is_best_seller)
    if price_on_request is not None:
        query = query.filter(Product.price_on_request == price_on_request)
    if stock_status is not None:
        query = query.filter(Product.stock_status == stock_status)

    # 5. Price Range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Total Count before pagination
    total = query.count()

    # 6. Sorting
    if sort_by == "oldest":
        query = query.order_by(Product.created_at.asc())
    elif sort_by == "name_asc":
        query = query.order_by(Product.name_en.asc())
    elif sort_by == "name_desc":
        query = query.order_by(Product.name_en.desc())
    elif sort_by == "price_asc":
        # Put nulls last for price ascending
        query = query.order_by(Product.price.asc().nullslast())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc().nullslast())
    else:
        # Default: newest first
        query = query.order_by(Product.created_at.desc())

    # 7. Pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 0

    items = [_to_list_item(p) for p in products]

    return PaginatedResponse[ProductListItem](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: Session = Depends(get_db)):
    """Retrieve complete product details with specifications, gallery images, variants, and related products."""
    product = (
        db.query(Product)
        .options(
            joinedload(Product.brand),
            selectinload(Product.categories),
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.attribute_values).joinedload(ProductAttributeValue.attribute),
        )
        .filter(Product.slug == slug, Product.is_published.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{slug}' not found",
        )

    # Fetch up to 4 related products from any shared category
    related_items: list[ProductListItem] = []
    if product.categories:
        cat_ids = [c.id for c in product.categories]
        related_products = (
            db.query(Product)
            .options(
                joinedload(Product.brand),
                selectinload(Product.categories),
                selectinload(Product.images),
            )
            .filter(
                Product.is_published.is_(True),
                Product.id != product.id,
                Product.categories.any(Category.id.in_(cat_ids)),
            )
            .order_by(Product.created_at.desc())
            .limit(4)
            .all()
        )
        related_items = [_to_list_item(p) for p in related_products]

    # Map attribute values
    attr_values_read = [
        ProductAttributeValueRead(
            id=av.id,
            attribute_id=av.attribute_id,
            attribute_slug=av.attribute.slug,
            attribute_name_en=av.attribute.name_en,
            attribute_name_ur=av.attribute.name_ur,
            value_en=av.value_en,
            value_ur=av.value_ur,
        )
        for av in product.attribute_values
    ]

    brand_read = None
    if product.brand and product.brand.is_published:
        brand_read = BrandRead.model_validate(product.brand)

    return ProductDetail(
        id=product.id,
        slug=product.slug,
        sku=product.sku,
        name_en=product.name_en,
        name_ur=product.name_ur,
        short_description_en=product.short_description_en,
        short_description_ur=product.short_description_ur,
        description_en=product.description_en,
        description_ur=product.description_ur,
        price=product.price,
        price_on_request=product.price_on_request,
        stock_status=product.stock_status,
        specifications=product.specifications,
        is_published=product.is_published,
        is_featured=product.is_featured,
        is_best_seller=product.is_best_seller,
        meta_title_en=product.meta_title_en,
        meta_title_ur=product.meta_title_ur,
        meta_description_en=product.meta_description_en,
        meta_description_ur=product.meta_description_ur,
        brand=brand_read,
        categories=[
            ProductCategorySnippet(id=c.id, slug=c.slug, name_en=c.name_en, name_ur=c.name_ur)
            for c in product.categories
        ],
        images=[ProductImageRead.model_validate(img) for img in product.images],
        attribute_values=attr_values_read,
        variants=[ProductVariantRead.model_validate(v) for v in product.variants if v.is_published],
        related_products=related_items,
    )
