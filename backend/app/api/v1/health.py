from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    try:
        # Check database connectivity with a lightweight ping
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "database": f"error: {str(e)}",
                "app_env": settings.APP_ENV,
                "version": "1.0.0",
            },
        )

    return HealthResponse(
        status="ok",
        database=db_status,
        app_env=settings.APP_ENV,
        version="1.0.0",
    )
