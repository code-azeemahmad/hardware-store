import math
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import require_roles
from app.db.session import get_db
from app.models.enquiry import Enquiry, EnquiryChannel, EnquiryStatus, EnquiryType
from app.models.product import Product
from app.models.user import AdminRole, AdminUser
from app.schemas.common import PaginatedResponse
from app.schemas.enquiry import EnquiryAdminDetail, EnquiryStatusUpdate

router = APIRouter(prefix="/enquiries", tags=["admin-enquiries"])


def _to_admin_detail(e: Enquiry, db: Session) -> EnquiryAdminDetail:
    product_name_en = None
    product_slug = None
    if e.product_id:
        prod = db.query(Product).filter(Product.id == e.product_id).first()
        if prod:
            product_name_en = prod.name_en
            product_slug = prod.slug

    return EnquiryAdminDetail(
        id=e.id,
        type=e.type,
        status=e.status,
        channel=e.channel,
        name=e.name,
        phone=e.phone,
        email=e.email,
        message=e.message,
        locale=e.locale,
        product_id=e.product_id,
        created_at=e.created_at,
        updated_at=e.updated_at,
        ip_address=e.ip_address,
        user_agent=e.user_agent,
        product_name_en=product_name_en,
        product_slug=product_slug,
    )


@router.get("", response_model=PaginatedResponse[EnquiryAdminDetail])
def list_admin_enquiries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[EnquiryStatus] = None,
    channel: Optional[EnquiryChannel] = None,
    type: Optional[EnquiryType] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ENQUIRY_HANDLER])
    ),
):
    """List customer enquiries with pagination, channel/status filters, and search."""
    query = db.query(Enquiry)

    if status:
        query = query.filter(Enquiry.status == status)
    if channel:
        query = query.filter(Enquiry.channel == channel)
    if type:
        query = query.filter(Enquiry.type == type)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Enquiry.name.ilike(term),
                Enquiry.phone.ilike(term),
                Enquiry.email.ilike(term),
                Enquiry.message.ilike(term),
            )
        )

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size
    items = query.order_by(Enquiry.created_at.desc()).offset(offset).limit(page_size).all()

    return PaginatedResponse(
        items=[_to_admin_detail(e, db) for e in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{enquiry_id}", response_model=EnquiryAdminDetail)
def get_enquiry(
    enquiry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ENQUIRY_HANDLER])
    ),
):
    """Get single enquiry detail."""
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")

    return _to_admin_detail(enquiry, db)


@router.patch("/{enquiry_id}", response_model=EnquiryAdminDetail)
@router.patch("/{enquiry_id}/status", response_model=EnquiryAdminDetail)
def update_enquiry_status(
    enquiry_id: uuid.UUID,
    payload: EnquiryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(
        require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.ENQUIRY_HANDLER])
    ),
):
    """Update enquiry resolution status (e.g. new -> in_progress -> resolved)."""
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")

    enquiry.status = payload.status
    db.commit()
    db.refresh(enquiry)

    return _to_admin_detail(enquiry, db)


@router.delete("/{enquiry_id}", status_code=status.HTTP_200_OK)
def delete_enquiry(
    enquiry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(require_roles([AdminRole.SUPER_ADMIN, AdminRole.ADMIN])),
):
    """Delete an enquiry record."""
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enquiry not found")

    db.delete(enquiry)
    db.commit()
    return {"message": "Enquiry deleted successfully"}
