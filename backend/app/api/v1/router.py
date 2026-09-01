from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.ws import router as ws_router
from app.api.v1.centers import router as centers_router
from app.api.v1.msp import router as msp_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.staff import router as staff_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(bookings_router)
api_v1_router.include_router(ws_router)
api_v1_router.include_router(centers_router)
api_v1_router.include_router(msp_router)
api_v1_router.include_router(complaints_router)
api_v1_router.include_router(staff_router)
