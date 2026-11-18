import time
from collections import defaultdict
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enquiry import Enquiry, EnquiryChannel, EnquiryStatus, EnquiryType
from app.schemas.enquiry import EnquiryCreate, EnquiryRead

router = APIRouter(tags=["enquiries"])

# In-memory sliding window rate limiter: IP -> list of timestamp floats
_ip_rate_limits: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 300  # 5 minutes
MAX_SUBMISSIONS_PER_WINDOW = 5


def _get_client_ip(request: Request) -> str:
    """Extract client IP handling reverse proxies (Nginx).
    Prioritizes X-Real-IP set authoritatively by Nginx ($remote_addr) to prevent
    client spoofing via arbitrary client-supplied X-Forwarded-For headers.
    """
    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip():
        return real_ip.strip()
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(client_ip: str) -> None:
    """Enforce rate limits per IP."""
    if client_ip == "unknown" or client_ip == "127.0.0.1":
        # Allow internal test client but still keep clean limit
        pass
    now = time.time()
    # Filter out timestamps older than the sliding window
    timestamps = [t for t in _ip_rate_limits[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(timestamps) >= MAX_SUBMISSIONS_PER_WINDOW:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many enquiry submissions from this IP. Please wait 5 minutes before trying again.",
        )
    timestamps.append(now)
    _ip_rate_limits[client_ip] = timestamps


def _process_submission(enquiry_in: EnquiryCreate, request: Request, db: Session) -> Enquiry:
    """Process, validate against honeypot, rate-limit, and save enquiry."""
    client_ip = _get_client_ip(request)
    _check_rate_limit(client_ip)
    user_agent = request.headers.get("user-agent", "")[:500]

    # Anti-spam Honeypot Check:
    # If the hidden honeypot field was filled, flag as SPAM without failing
    is_spam = bool(enquiry_in.hp_field and enquiry_in.hp_field.strip())
    initial_status = EnquiryStatus.SPAM if is_spam else EnquiryStatus.NEW

    enquiry = Enquiry(
        type=enquiry_in.type,
        status=initial_status,
        channel=enquiry_in.channel,
        name=enquiry_in.name,
        phone=enquiry_in.phone,
        email=str(enquiry_in.email) if enquiry_in.email else None,
        message=enquiry_in.message,
        locale=enquiry_in.locale,
        product_id=enquiry_in.product_id,
        ip_address=client_ip,
        user_agent=user_agent,
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.post("/enquiries", response_model=EnquiryRead, status_code=status.HTTP_201_CREATED)
def submit_enquiry(enquiry_in: EnquiryCreate, request: Request, db: Session = Depends(get_db)):
    """Submit a product or general enquiry with anti-spam honeypot and IP rate limiting."""
    return _process_submission(enquiry_in, request, db)


@router.post("/contact", response_model=EnquiryRead, status_code=status.HTTP_201_CREATED)
def submit_contact_message(enquiry_in: EnquiryCreate, request: Request, db: Session = Depends(get_db)):
    """General contact message endpoint alias as specified in API documentation."""
    # Ensure type is set to GENERAL for /contact
    enquiry_in.type = EnquiryType.GENERAL
    return _process_submission(enquiry_in, request, db)
