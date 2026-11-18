import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryDetail, CategoryRead, CategoryTree

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryRead])
def list_categories(
    root_only: bool = Query(False, description="Filter for top-level categories with no parent"),
    db: Session = Depends(get_db),
):
    """Retrieve published categories list."""
    query = db.query(Category).filter(Category.is_published.is_(True))
    if root_only:
        query = query.filter(Category.parent_id.is_(None))
    categories = query.order_by(Category.sort_order.asc(), Category.name_en.asc()).all()
    return categories


@router.get("/tree", response_model=List[CategoryTree])
def get_category_tree(db: Session = Depends(get_db)):
    """Retrieve hierarchical category tree for main navigation and mega-menus."""
    # Fetch all published categories ordered by sort_order
    all_categories = (
        db.query(Category)
        .filter(Category.is_published.is_(True))
        .order_by(Category.sort_order.asc(), Category.name_en.asc())
        .all()
    )

    # Build category map and tree
    cat_map = {cat.id: cat for cat in all_categories}
    children_map: dict[uuid.UUID, list[Category]] = {}
    roots: list[Category] = []

    for cat in all_categories:
        if cat.parent_id is None or cat.parent_id not in cat_map:
            roots.append(cat)
        else:
            children_map.setdefault(cat.parent_id, []).append(cat)

    def build_node(cat: Category) -> CategoryTree:
        kids = children_map.get(cat.id, [])
        return CategoryTree(
            id=cat.id,
            slug=cat.slug,
            name_en=cat.name_en,
            name_ur=cat.name_ur,
            description_en=cat.description_en,
            description_ur=cat.description_ur,
            image_url=cat.image_url,
            sort_order=cat.sort_order,
            is_published=cat.is_published,
            parent_id=cat.parent_id,
            meta_title_en=cat.meta_title_en,
            meta_title_ur=cat.meta_title_ur,
            meta_description_en=cat.meta_description_en,
            meta_description_ur=cat.meta_description_ur,
            children=[build_node(k) for k in kids],
        )

    return [build_node(r) for r in roots]


@router.get("/{slug}", response_model=CategoryDetail)
def get_category(slug: str, db: Session = Depends(get_db)):
    """Retrieve category details by slug with parent, direct children, and product count."""
    category = (
        db.query(Category)
        .options(joinedload(Category.parent))
        .filter(Category.slug == slug, Category.is_published.is_(True))
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{slug}' not found",
        )

    # Subcategories (children)
    children = (
        db.query(Category)
        .filter(Category.parent_id == category.id, Category.is_published.is_(True))
        .order_by(Category.sort_order.asc(), Category.name_en.asc())
        .all()
    )

    # Count published products in this category (or its children)
    child_ids = [c.id for c in children]
    all_target_ids = [category.id] + child_ids
    product_count = (
        db.query(Product)
        .filter(
            Product.is_published.is_(True),
            Product.categories.any(Category.id.in_(all_target_ids)),
        )
        .count()
    )

    parent_read = None
    if category.parent and category.parent.is_published:
        parent_read = CategoryRead.model_validate(category.parent)

    return CategoryDetail(
        id=category.id,
        slug=category.slug,
        name_en=category.name_en,
        name_ur=category.name_ur,
        description_en=category.description_en,
        description_ur=category.description_ur,
        image_url=category.image_url,
        sort_order=category.sort_order,
        is_published=category.is_published,
        parent_id=category.parent_id,
        meta_title_en=category.meta_title_en,
        meta_title_ur=category.meta_title_ur,
        meta_description_en=category.meta_description_en,
        meta_description_ur=category.meta_description_ur,
        parent=parent_read,
        children=[CategoryRead.model_validate(c) for c in children],
        product_count=product_count,
    )
