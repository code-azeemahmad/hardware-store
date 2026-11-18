import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.session import get_db
from app.models.product import Brand, Product
from app.models.user import AdminRole, AdminUser
from app.schemas.category import TranslationStatus
from app.schemas.product import AdminBrandRead, BrandCreate, BrandRead, BrandUpdate

router = APIRouter(prefix="/brands", tags=["admin-brands"])


def _compute_translation_status(brand: Brand) -> TranslationStatus:
    has_en = bool(brand.name and brand.name.strip())
    has_desc_en = bool(brand.description_en and brand.description_en.strip())
    has_desc_ur = bool(brand.description_ur and brand.description_ur.strip())
    if not has_en:
        return TranslationStatus.INCOMPLETE
    if has_desc_en and not has_desc_ur:
        return TranslationStatus.MISSING_UR
    return TranslationStatus.COMPLETE


@router.get("", response_model=list[AdminBrandRead])
def list_admin_brands(
    is_published: Optional[bool] = None,
    translation_status: Optional[TranslationStatus] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """List all brands with product counts and translation statuses."""
    query = db.query(Brand)
    if is_published is not None:
        query = query.filter(Brand.is_published == is_published)

    brands = query.order_by(Brand.sort_order.asc(), Brand.name.asc()).all()

    counts_map = dict(
        db.query(Brand.id, func.count(Product.id))
        .join(Product, Product.brand_id == Brand.id)
        .group_by(Brand.id)
        .all()
    )

    results: list[AdminBrandRead] = []
    for b in brands:
        status_val = _compute_translation_status(b)
        if translation_status and status_val != translation_status:
            continue
        item = AdminBrandRead.model_validate(b)
        item.product_count = counts_map.get(b.id, 0)
        item.translation_status = status_val
        results.append(item)

    return results


@router.post("", response_model=AdminBrandRead, status_code=status.HTTP_201_CREATED)
def create_brand(
    data: BrandCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Create a new brand."""
    existing = db.query(Brand).filter(Brand.slug == data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Brand with slug '{data.slug}' already exists",
        )

    brand = Brand(**data.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)

    res = AdminBrandRead.model_validate(brand)
    res.product_count = 0
    res.translation_status = _compute_translation_status(brand)
    return res


@router.get("/{brand_id}", response_model=BrandRead)
def get_brand(
    brand_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Get single brand detail."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    brand_read = BrandRead.model_validate(brand)
    brand_read.product_count = len(brand.products)
    return brand_read


@router.put("/{brand_id}", response_model=AdminBrandRead)
def update_brand(
    brand_id: uuid.UUID,
    data: BrandUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Update brand fields."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    update_dict = data.model_dump(exclude_unset=True)

    if "slug" in update_dict and update_dict["slug"] != brand.slug:
        existing = db.query(Brand).filter(Brand.slug == update_dict["slug"]).first()
        if existing and existing.id != brand.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Brand with slug '{update_dict['slug']}' already exists",
            )

    for field, val in update_dict.items():
        setattr(brand, field, val)

    db.commit()
    db.refresh(brand)

    res = AdminBrandRead.model_validate(brand)
    res.product_count = len(brand.products)
    res.translation_status = _compute_translation_status(brand)
    return res


@router.delete("/{brand_id}", status_code=status.HTTP_200_OK)
def delete_brand(
    brand_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN])),
):
    """Delete a brand."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    # Unlink any products first
    for prod in brand.products:
        prod.brand_id = None

    db.delete(brand)
    db.commit()
    return {"message": "Brand deleted successfully"}


@router.patch("/{brand_id}/publish", response_model=AdminBrandRead)
def toggle_publish_brand(
    brand_id: uuid.UUID,
    is_published: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Quickly toggle brand published status."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand not found")

    brand.is_published = is_published
    db.commit()
    db.refresh(brand)

    res = AdminBrandRead.model_validate(brand)
    res.product_count = len(brand.products)
    res.translation_status = _compute_translation_status(brand)
    return res
