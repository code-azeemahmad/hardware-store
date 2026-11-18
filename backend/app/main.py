from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.exceptions import AppException


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    yield
    # Shutdown actions


app = FastAPI(
    title="Hardware & Plywood Store API",
    version="1.0.0",
    description="Backend REST API for bilingual hardware and plywood product catalogue & admin dashboard",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
)

# CORS Configuration
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )


# Include API v1 router
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Hardware & Plywood Store API is running",
        "api_v1": "/api/v1/health",
        "docs": "/api/docs" if settings.DEBUG else None,
    }
