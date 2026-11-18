import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.models.user import AdminRole, AdminUser
from app.schemas.category import (
    AdminCategoryRead,
    CategoryCreate,
    CategoryDetail,
    CategoryRead,
    CategoryUpdate,
    TranslationStatus,
)

router = APIRouter(prefix="/categories", tags=["admin-categories"])


def _compute_translation_status(cat: Category) -> TranslationStatus:
    has_en = bool(cat.name_en and cat.name_en.strip())
    has_ur = bool(cat.name_ur and cat.name_ur.strip())
    if not has_en:
        return TranslationStatus.INCOMPLETE
    if not has_ur:
        return TranslationStatus.MISSING_UR
    return TranslationStatus.COMPLETE


@router.get("", response_model=list[AdminCategoryRead])
def list_admin_categories(
    parent_id: Optional[uuid.UUID] = None,
    is_published: Optional[bool] = None,
    translation_status: Optional[TranslationStatus] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """List all categories with product counts and translation statuses."""
    query = db.query(Category)
    if parent_id is not None:
        query = query.filter(Category.parent_id == parent_id)
    if is_published is not None:
        query = query.filter(Category.is_published == is_published)

    categories = query.order_by(Category.sort_order.asc(), Category.name_en.asc()).all()

    # Pre-calculate product counts
    counts_map = dict(
        db.query(Category.id, func.count(Product.id))
        .join(Category.products)
        .group_by(Category.id)
        .all()
    )

    results: list[AdminCategoryRead] = []
    for cat in categories:
        status_val = _compute_translation_status(cat)
        if translation_status and status_val != translation_status:
            continue
        item = AdminCategoryRead.model_validate(cat)
        item.product_count = counts_map.get(cat.id, 0)
        item.translation_status = status_val
        results.append(item)

    return results


@router.post("", response_model=AdminCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Create a new category."""
    existing = db.query(Category).filter(Category.slug == data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category with slug '{data.slug}' already exists",
        )

    if data.parent_id:
        parent = db.query(Category).filter(Category.id == data.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent category with id '{data.parent_id}' not found",
            )

    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)

    res = AdminCategoryRead.model_validate(cat)
    res.product_count = 0
    res.translation_status = _compute_translation_status(cat)
    return res


@router.get("/{category_id}", response_model=CategoryDetail)
def get_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Get category detail including parent and children."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    count = len(cat.products)
    detail = CategoryDetail.model_validate(cat)
    detail.product_count = count
    return detail


@router.put("/{category_id}", response_model=AdminCategoryRead)
def update_category(
    category_id: uuid.UUID,
    data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Update category fields."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_dict = data.model_dump(exclude_unset=True)

    # Check slug conflict if updating slug
    if "slug" in update_dict and update_dict["slug"] != cat.slug:
        existing = db.query(Category).filter(Category.slug == update_dict["slug"]).first()
        if existing and existing.id != cat.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category with slug '{update_dict['slug']}' already exists",
            )

    # Prevent assigning self as parent
    if "parent_id" in update_dict and update_dict["parent_id"] == cat.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A category cannot be its own parent",
        )

    for field, val in update_dict.items():
        setattr(cat, field, val)

    db.commit()
    db.refresh(cat)

    res = AdminCategoryRead.model_validate(cat)
    res.product_count = len(cat.products)
    res.translation_status = _compute_translation_status(cat)
    return res


@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN])),
):
    """Delete a category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.patch("/{category_id}/publish", response_model=AdminCategoryRead)
def toggle_publish_category(
    category_id: uuid.UUID,
    is_published: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.CATALOGUE_EDITOR])
    ),
):
    """Quickly toggle category published status."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    cat.is_published = is_published
    db.commit()
    db.refresh(cat)

    res = AdminCategoryRead.model_validate(cat)
    res.product_count = len(cat.products)
    res.translation_status = _compute_translation_status(cat)
    return res
