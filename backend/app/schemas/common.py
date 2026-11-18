from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class HealthResponse(BaseModel):
    status: str
    database: str
    app_env: str
    version: str = "1.0.0"


class ErrorDetail(BaseModel):
    detail: str
    code: str = "ERROR"


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
