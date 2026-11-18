from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryRead

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    categories = (
        db.query(Category)
        .filter(Category.is_published.is_(True))
        .order_by(Category.sort_order.asc(), Category.name_en.asc())
        .all()
    )
    return categories
