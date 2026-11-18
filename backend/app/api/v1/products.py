from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductRead

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductRead])
def list_products(
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
    category_slug: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product).filter(Product.is_published.is_(True))
    if category_slug:
        query = query.filter(Product.categories.any(slug=category_slug))
    products = query.order_by(Product.created_at.desc()).offset(offset).limit(limit).all()
    return products
