from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enquiry import Enquiry
from app.schemas.enquiry import EnquiryCreate, EnquiryRead

router = APIRouter(prefix="/enquiries", tags=["enquiries"])


@router.post("", response_model=EnquiryRead, status_code=status.HTTP_201_CREATED)
def submit_enquiry(enquiry_in: EnquiryCreate, db: Session = Depends(get_db)):
    enquiry = Enquiry(
        type=enquiry_in.type,
        name=enquiry_in.name,
        phone=enquiry_in.phone,
        email=enquiry_in.email,
        message=enquiry_in.message,
        locale=enquiry_in.locale,
        product_id=enquiry_in.product_id,
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry
