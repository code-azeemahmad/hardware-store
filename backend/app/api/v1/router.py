from fastapi import APIRouter

from app.api.v1 import auth, categories, health, products, enquiries

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router)
api_v1_router.include_router(categories.router)
api_v1_router.include_router(products.router)
api_v1_router.include_router(enquiries.router)
