import enum
import uuid
from decimal import Decimal
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict
from app.models.product import StockStatus
from app.schemas.category import TranslationStatus


class ProductImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    image_url: str
    alt_text_en: Optional[str] = None
    alt_text_ur: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False


class ProductImageInput(BaseModel):
    image_url: str
    alt_text_en: Optional[str] = None
    alt_text_ur: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False


class BrandBase(BaseModel):
    slug: str
    name: str
    logo_url: Optional[str] = None
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    website_url: Optional[str] = None
    sort_order: int = 0
    is_published: bool = True


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BaseModel):
    slug: Optional[str] = None
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    website_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_published: Optional[bool] = None


class BrandRead(BrandBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_count: Optional[int] = None


class AdminBrandRead(BrandRead):
    translation_status: TranslationStatus = TranslationStatus.COMPLETE


class AttributeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name_en: str
    name_ur: str
    is_filterable: bool = True
    sort_order: int = 0


class AttributeValueInput(BaseModel):
    attribute_slug: str
    value_en: str
    value_ur: str


class ProductAttributeValueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    attribute_id: uuid.UUID
    attribute_slug: str
    attribute_name_en: str
    attribute_name_ur: str
    value_en: str
    value_ur: str


class VariantInput(BaseModel):
    sku: Optional[str] = None
    name_en: str
    name_ur: str
    price: Optional[Decimal] = None
    price_on_request: bool = True
    stock_status: StockStatus = StockStatus.IN_STOCK
    specifications: Optional[dict[str, Any]] = None
    sort_order: int = 0
    is_published: bool = True


class ProductVariantRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    sku: Optional[str] = None
    name_en: str
    name_ur: str
    price: Optional[Decimal] = None
    price_on_request: bool = True
    stock_status: StockStatus = StockStatus.ORDER_BASED
    specifications: Optional[dict[str, Any]] = None
    sort_order: int = 0
    is_published: bool = True


class ProductCategorySnippet(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name_en: str
    name_ur: str


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
    stock_status: StockStatus = StockStatus.ORDER_BASED
    specifications: Optional[dict[str, Any]] = None
    is_published: bool = True
    is_featured: bool = False
    is_best_seller: bool = False
    meta_title_en: Optional[str] = None
    meta_title_ur: Optional[str] = None
    meta_description_en: Optional[str] = None
    meta_description_ur: Optional[str] = None


class ProductCreate(ProductBase):
    brand_id: Optional[uuid.UUID] = None
    category_ids: List[uuid.UUID] = []
    images: List[ProductImageInput] = []
    attributes: List[AttributeValueInput] = []
    variants: List[VariantInput] = []


class ProductUpdate(BaseModel):
    slug: Optional[str] = None
    sku: Optional[str] = None
    name_en: Optional[str] = None
    name_ur: Optional[str] = None
    short_description_en: Optional[str] = None
    short_description_ur: Optional[str] = None
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    price: Optional[Decimal] = None
    price_on_request: Optional[bool] = None
    stock_status: Optional[StockStatus] = None
    specifications: Optional[dict[str, Any]] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    brand_id: Optional[uuid.UUID] = None
    category_ids: Optional[List[uuid.UUID]] = None
    meta_title_en: Optional[str] = None
    meta_title_ur: Optional[str] = None
    meta_description_en: Optional[str] = None
    meta_description_ur: Optional[str] = None


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    sku: Optional[str] = None
    name_en: str
    name_ur: str
    short_description_en: Optional[str] = None
    short_description_ur: Optional[str] = None
    price: Optional[Decimal] = None
    price_on_request: bool = True
    stock_status: StockStatus = StockStatus.ORDER_BASED
    is_featured: bool = False
    is_best_seller: bool = False
    brand_name: Optional[str] = None
    brand_slug: Optional[str] = None
    primary_image_url: Optional[str] = None
    primary_image_alt_en: Optional[str] = None
    primary_image_alt_ur: Optional[str] = None
    categories: List[ProductCategorySnippet] = []


class AdminProductListItem(ProductListItem):
    is_published: bool = True
    translation_status: TranslationStatus = TranslationStatus.COMPLETE


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    brand: Optional[BrandRead] = None
    images: List[ProductImageRead] = []
    categories: List[ProductCategorySnippet] = []


class ProductDetail(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    brand: Optional[BrandRead] = None
    categories: List[ProductCategorySnippet] = []
    images: List[ProductImageRead] = []
    attribute_values: List[ProductAttributeValueRead] = []
    variants: List[ProductVariantRead] = []
    related_products: List[ProductListItem] = []
