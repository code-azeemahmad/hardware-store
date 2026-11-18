from fastapi import APIRouter

from app.api.v1.admin.brands import router as brands_router
from app.api.v1.admin.build import router as build_router
from app.api.v1.admin.categories import router as categories_router
from app.api.v1.admin.dashboard import router as dashboard_router
from app.api.v1.admin.enquiries import router as enquiries_router
from app.api.v1.admin.invitations import router as invitations_router
from app.api.v1.admin.media import router as media_router
from app.api.v1.admin.products import router as products_router

admin_router = APIRouter(prefix="/admin")

admin_router.include_router(dashboard_router)
admin_router.include_router(categories_router)
admin_router.include_router(brands_router)
admin_router.include_router(products_router)
admin_router.include_router(media_router)
admin_router.include_router(enquiries_router)
admin_router.include_router(invitations_router)
admin_router.include_router(build_router)
