import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


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


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID


class CategoryTree(CategoryRead):
    children: List["CategoryTree"] = []


CategoryTree.model_rebuild()
