from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.session import get_db
from app.models.category import Category
from app.models.enquiry import Enquiry, EnquiryStatus
from app.models.product import Brand, Product
from app.models.user import AdminRole, AdminUser
from app.schemas.enquiry import EnquiryRead

router = APIRouter(prefix="/dashboard", tags=["admin-dashboard"])


@router.get("/metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([
            AdminRole.SUPER_ADMIN,
            AdminRole.ADMIN,
            AdminRole.CATALOGUE_EDITOR,
            AdminRole.ENQUIRY_HANDLER,
        ])
    ),
) -> dict[str, Any]:
    """Retrieve top-level KPI metrics and counts for the Admin Dashboard."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    published_products = (
        db.query(func.count(Product.id)).filter(Product.is_published.is_(True)).scalar() or 0
    )
    total_categories = db.query(func.count(Category.id)).scalar() or 0
    total_brands = db.query(func.count(Brand.id)).scalar() or 0

    total_enquiries = db.query(func.count(Enquiry.id)).scalar() or 0
    new_enquiries = (
        db.query(func.count(Enquiry.id)).filter(Enquiry.status == EnquiryStatus.NEW).scalar() or 0
    )

    # Calculate products missing Urdu translations
    all_prods = db.query(Product.name_en, Product.name_ur, Product.short_description_en, Product.short_description_ur).all()
    missing_ur_count = sum(
        1
        for p in all_prods
        if (p.name_en and not p.name_ur) or (p.short_description_en and not p.short_description_ur)
    )

    # Recent 5 enquiries
    recent_enquiries = (
        db.query(Enquiry)
        .order_by(Enquiry.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_products": total_products,
        "published_products": published_products,
        "total_categories": total_categories,
        "total_brands": total_brands,
        "total_enquiries": total_enquiries,
        "new_enquiries": new_enquiries,
        "missing_urdu_translations": missing_ur_count,
        "recent_enquiries": [EnquiryRead.model_validate(e) for e in recent_enquiries],
    }
