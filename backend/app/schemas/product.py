import uuid
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ProductImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    image_url: str
    alt_text_en: Optional[str] = None
    alt_text_ur: Optional[str] = None
    sort_order: int
    is_primary: bool


class BrandRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    logo_url: Optional[str] = None


class ProductBase(BaseModel):
    slug: str
    sku: Optional[str] = None
    name_en: str
    name_ur: str
    short_description_en: Optional[str] = None
    short_description_ur: Optional[str] = None
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    price: Optional[Decimal] = None
    price_on_request: bool = True
    is_published: bool = True
    is_featured: bool = False
    is_best_seller: bool = False


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    brand: Optional[BrandRead] = None
    images: List[ProductImageRead] = []
