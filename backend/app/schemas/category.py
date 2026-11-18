import enum
import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TranslationStatus(str, enum.Enum):
    COMPLETE = "complete"
    MISSING_UR = "missing_ur"
    INCOMPLETE = "incomplete"


class CategoryBase(BaseModel):
    slug: str
    name_en: str
    name_ur: str
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: int = 0
    is_published: bool = True
    parent_id: Optional[uuid.UUID] = None

    # Localized SEO Metadata
    meta_title_en: Optional[str] = None
    meta_title_ur: Optional[str] = None
    meta_description_en: Optional[str] = None
    meta_description_ur: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    slug: Optional[str] = None
    name_en: Optional[str] = None
    name_ur: Optional[str] = None
    description_en: Optional[str] = None
    description_ur: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_published: Optional[bool] = None
    parent_id: Optional[uuid.UUID] = None
    meta_title_en: Optional[str] = None
    meta_title_ur: Optional[str] = None
    meta_description_en: Optional[str] = None
    meta_description_ur: Optional[str] = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class AdminCategoryRead(CategoryRead):
    product_count: int = 0
    translation_status: TranslationStatus = TranslationStatus.COMPLETE


class CategoryTree(CategoryRead):
    children: List["CategoryTree"] = []


class CategoryDetail(CategoryRead):
    parent: Optional[CategoryRead] = None
    children: List[CategoryRead] = []
    product_count: int = 0


CategoryTree.model_rebuild()
