from fastapi import APIRouter

from app.api.v1 import auth, brands, categories, enquiries, health, products
from app.api.v1.admin.router import admin_router

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(categories.router)
api_v1_router.include_router(brands.router)
api_v1_router.include_router(products.router)
api_v1_router.include_router(enquiries.router)
api_v1_router.include_router(admin_router)

