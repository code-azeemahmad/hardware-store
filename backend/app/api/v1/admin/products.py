import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.dependencies import require_roles
from app.db.session import get_db
from app.models.category import Category
from app.models.product import (
    Attribute,
    Brand,
    Product,
    ProductAttributeValue,
    ProductImage,
    ProductVariant,
    StockStatus,
)
from app.models.user import AdminRole, AdminUser
from app.schemas.category import TranslationStatus
from app.schemas.common import PaginatedResponse
from app.schemas.product import (
    AdminProductListItem,
    ProductCategorySnippet,
    ProductCreate,
    ProductDetail,
    ProductImageInput,
    ProductImageRead,
    ProductUpdate,
    ProductVariantRead,
    VariantInput,
)
from app.api.v1.admin.media import cleanup_unreferenced_media_file

router = APIRouter(prefix="/products", tags=["admin-products"])


def _compute_product_translation_status(p: Product) -> TranslationStatus:
    has_name_en = bool(p.name_en and p.name_en.strip())
    has_name_ur = bool(p.name_ur and p.name_ur.strip())
    has_desc_en = bool(p.short_description_en and p.short_description_en.strip())
    has_desc_ur = bool(p.short_description_ur and p.short_description_ur.strip())

    if not has_name_en:
        return TranslationStatus.INCOMPLETE
    if not has_name_ur or (has_desc_en and not has_desc_ur):
        return TranslationStatus.MISSING_UR
    return TranslationStatus.COMPLETE


def _to_admin_list_item(p: Product) -> AdminProductListItem:
    primary_img = None
    for img in sorted(p.images, key=lambda x: x.sort_order):
        if img.is_primary:
            primary_img = img
            break
    if not primary_img and p.images:
        primary_img = p.images[0]

    return AdminProductListItem(
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
        is_published=p.is_published,
        translation_status=_compute_product_translation_status(p),
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


@router.get("", response_model=PaginatedResponse[AdminProductListItem])
def list_admin_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    category_id: Optional[uuid.UUID] = None,
    brand_id: Optional[uuid.UUID] = None,
    stock_status: Optional[StockStatus] = None,
    is_published: Optional[bool] = None,
    translation_status: Optional[TranslationStatus] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """List products with administrative filters and translation status."""
    query = (
        db.query(Product)
        .options(
            joinedload(Product.brand),
            selectinload(Product.categories),
            selectinload(Product.images),
        )
    )

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Product.name_en.ilike(term),
                Product.name_ur.ilike(term),
                Product.sku.ilike(term),
                Product.slug.ilike(term),
            )
        )

    if category_id:
        query = query.filter(Product.categories.any(id=category_id))

    if brand_id:
        query = query.filter(Product.brand_id == brand_id)

    if stock_status:
        query = query.filter(Product.stock_status == stock_status)

    if is_published is not None:
        query = query.filter(Product.is_published == is_published)

    all_matched = query.order_by(Product.created_at.desc()).all()

    # Filter in memory for translation_status if specified
    if translation_status:
        filtered = [p for p in all_matched if _compute_product_translation_status(p) == translation_status]
    else:
        filtered = all_matched

    total = len(filtered)
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    page_items = filtered[offset : offset + page_size]

    return PaginatedResponse(
        items=[_to_admin_list_item(p) for p in page_items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("", response_model=ProductDetail, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Create a new product with categories, specs, attributes, images, and variants."""
    existing = db.query(Product).filter(Product.slug == data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with slug '{data.slug}' already exists",
        )

    categories = []
    if data.category_ids:
        categories = db.query(Category).filter(Category.id.in_(data.category_ids)).all()

    brand = None
    if data.brand_id:
        brand = db.query(Brand).filter(Brand.id == data.brand_id).first()
        if not brand:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    product = Product(
        slug=data.slug,
        sku=data.sku,
        name_en=data.name_en,
        name_ur=data.name_ur,
        short_description_en=data.short_description_en,
        short_description_ur=data.short_description_ur,
        description_en=data.description_en,
        description_ur=data.description_ur,
        price=data.price,
        price_on_request=data.price_on_request,
        stock_status=data.stock_status,
        specifications=data.specifications,
        is_published=data.is_published,
        is_featured=data.is_featured,
        is_best_seller=data.is_best_seller,
        meta_title_en=data.meta_title_en,
        meta_title_ur=data.meta_title_ur,
        meta_description_en=data.meta_description_en,
        meta_description_ur=data.meta_description_ur,
        brand_id=brand.id if brand else None,
        categories=categories,
    )
    db.add(product)
    db.flush()

    # Add images
    for img_in in data.images:
        img = ProductImage(**img_in.model_dump(), product_id=product.id)
        db.add(img)

    # Add dynamic attributes
    attr_map = {a.slug: a for a in db.query(Attribute).all()}
    for attr_in in data.attributes:
        if attr_in.attribute_slug in attr_map:
            pav = ProductAttributeValue(
                product_id=product.id,
                attribute_id=attr_map[attr_in.attribute_slug].id,
                value_en=attr_in.value_en,
                value_ur=attr_in.value_ur,
            )
            db.add(pav)

    # Add variants
    for v_in in data.variants:
        var = ProductVariant(**v_in.model_dump(), product_id=product.id)
        db.add(var)

    db.commit()
    db.refresh(product)

    # Reload with full options
    return get_admin_product(product.id, db, current_user)


@router.get("/{product_id}", response_model=ProductDetail)
def get_admin_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Get complete product detail for administrative editing."""
    product = (
        db.query(Product)
        .options(
            joinedload(Product.brand),
            selectinload(Product.categories),
            selectinload(Product.images),
            selectinload(Product.variants),
            selectinload(Product.attribute_values).joinedload(ProductAttributeValue.attribute),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    detail = ProductDetail.model_validate(product)
    return detail


@router.put("/{product_id}", response_model=ProductDetail)
def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Update product fields and associations."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_dict = data.model_dump(exclude_unset=True)

    # Slug conflict check
    if "slug" in update_dict and update_dict["slug"] != product.slug:
        existing = db.query(Product).filter(Product.slug == update_dict["slug"]).first()
        if existing and existing.id != product.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with slug '{update_dict['slug']}' already exists",
            )

    # Categories update
    if "category_ids" in update_dict:
        cat_ids = update_dict.pop("category_ids")
        if cat_ids is not None:
            product.categories = db.query(Category).filter(Category.id.in_(cat_ids)).all()

    for field, val in update_dict.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)

    return get_admin_product(product.id, db, current_user)


@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN])),
):
    """Delete a product and its associated variants and images."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    image_urls = [img.image_url for img in product.images]
    db.delete(product)
    db.commit()

    for url in image_urls:
        cleanup_unreferenced_media_file(url, db)

    return {"message": "Product deleted successfully"}


@router.patch("/{product_id}/publish", response_model=AdminProductListItem)
def toggle_publish_product(
    product_id: uuid.UUID,
    is_published: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Quickly toggle product published status."""
    product = (
        db.query(Product)
        .options(
            joinedload(Product.brand),
            selectinload(Product.categories),
            selectinload(Product.images),
        )
        .filter(Product.id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    product.is_published = is_published
    db.commit()
    db.refresh(product)

    return _to_admin_list_item(product)


@router.post("/{product_id}/images", response_model=ProductImageRead, status_code=status.HTTP_201_CREATED)
def add_product_image(
    product_id: uuid.UUID,
    data: ProductImageInput,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Attach an image to product gallery."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    # If new image is marked primary, unset other primary images
    if data.is_primary:
        for img in product.images:
            img.is_primary = False

    new_img = ProductImage(**data.model_dump(), product_id=product.id)
    db.add(new_img)
    db.commit()
    db.refresh(new_img)
    return new_img


@router.delete("/{product_id}/images/{image_id}", status_code=status.HTTP_200_OK)
def remove_product_image(
    product_id: uuid.UUID,
    image_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Remove an image from product gallery."""
    img = (
        db.query(ProductImage)
        .filter(ProductImage.id == image_id, ProductImage.product_id == product_id)
        .first()
    )
    if not img:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    target_url = img.image_url
    db.delete(img)
    db.commit()

    cleanup_unreferenced_media_file(target_url, db)
    return {"message": "Image removed successfully"}


@router.post("/{product_id}/variants", response_model=ProductVariantRead, status_code=status.HTTP_201_CREATED)
def add_product_variant(
    product_id: uuid.UUID,
    data: VariantInput,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Add a child variant to product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    new_var = ProductVariant(**data.model_dump(), product_id=product.id)
    db.add(new_var)
    db.commit()
    db.refresh(new_var)
    return new_var


@router.delete("/{product_id}/variants/{variant_id}", status_code=status.HTTP_200_OK)
def remove_product_variant(
    product_id: uuid.UUID,
    variant_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Delete a child variant."""
    variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.id == variant_id, ProductVariant.product_id == product_id)
        .first()
    )
    if not variant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Variant not found")

    db.delete(variant)
    db.commit()
    return {"message": "Variant deleted successfully"}
