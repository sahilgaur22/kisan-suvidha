import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, or_
from app.config import settings
from app.database import engine, Base, AsyncSessionLocal
from app.models.user import User
from app.models.role import Role
from app.models.center import Center
from app.core.security import get_password_hash
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Auto-creates DB tables and seeds default roles & demo accounts on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed Default Roles, Center & Demo Users if missing
    async with AsyncSessionLocal() as db:
        role_names = ["center_admin", "staff", "farmer"]
        for idx, name in enumerate(role_names, 1):
            stmt = select(Role).where(Role.name == name)
            res = await db.execute(stmt)
            if not res.scalar_one_or_none():
                db.add(Role(id=idx, name=name))
        await db.commit()

        # Seed Default Center
        center_id = uuid.UUID("11111111-1111-1111-1111-111111111111")
        center_stmt = select(Center).where(or_(Center.id == center_id, Center.code == "MP-CTR-014"))
        center_res = await db.execute(center_stmt)
        if not center_res.scalar_one_or_none():
            db.add(Center(
                id=center_id,
                name="Bhopal Main Procurement Mandi",
                code="MP-CTR-014",
                state="Madhya Pradesh",
                district="Bhopal",
                address="Krishi Upaj Mandi, Karond, Bhopal",
                max_daily_throughput=100,
                avg_processing_minutes=15,
                is_active=True
            ))
            await db.commit()

        # Seed Admin User (admin@kisansuvidha.gov.in)
        admin_stmt = select(User).where(User.email == "admin@kisansuvidha.gov.in")
        admin_user = (await db.execute(admin_stmt)).scalar_one_or_none()
        if not admin_user:
            db.add(User(
                full_name="Bhopal Mandi Admin",
                phone="9876543210",
                email="admin@kisansuvidha.gov.in",
                password_hash=get_password_hash("password123"),
                role_id=1, # center_admin
                center_id=center_id,
                is_active=True
            ))
        else:
            admin_user.role_id = 1

        # Seed Staff User (staff@kisansuvidha.gov.in)
        staff_stmt = select(User).where(User.email == "staff@kisansuvidha.gov.in")
        staff_user = (await db.execute(staff_stmt)).scalar_one_or_none()
        if not staff_user:
            db.add(User(
                full_name="Ramesh Ground Officer",
                phone="9876543211",
                email="staff@kisansuvidha.gov.in",
                password_hash=get_password_hash("password123"),
                role_id=2, # staff
                center_id=center_id,
                is_active=True
            ))
        else:
            staff_user.role_id = 2

        # Seed 5 Standard Crop Types with FAQ & Rejection Moisture Limits
        crops_data = [
            ("Paddy (Dhan)", 2300.00, 17.0, 19.0),
            ("Wheat (Gehu)", 2275.00, 12.0, 14.0),
            ("Maize (Makka)", 2090.00, 14.0, 16.0),
            ("Mustard / Rapeseed", 5650.00, 8.0, 10.0),
            ("Soyabean / Pulses", 4600.00, 12.0, 14.0),
        ]
        from app.models.msp_rate import MSPRate
        for crop_name, rate, faq_m, max_m in crops_data:
            crop_stmt = select(MSPRate).where(MSPRate.crop_name == crop_name)
            crop_res = await db.execute(crop_stmt)
            existing_c = crop_res.scalar_one_or_none()
            if not existing_c:
                db.add(MSPRate(
                    id=uuid.uuid4(),
                    crop_name=crop_name,
                    rate_per_quintal=rate,
                    permitted_moisture_percent=faq_m,
                    max_rejection_moisture_percent=max_m,
                ))
            else:
                existing_c.permitted_moisture_percent = faq_m
        # Seed Demo Registered Farmer (phone: 9876543212)
        from app.models.farmer import Farmer
        farmer_stmt = select(Farmer).where(Farmer.phone == "9876543212")
        farmer_res = await db.execute(farmer_stmt)
        if not farmer_res.scalar_one_or_none():
            db.add(Farmer(
                id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
                full_name="Rajesh Patel (Farmer)",
                phone="9876543212",
                preferred_language="hi",
            ))
            await db.commit()

        await db.commit()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dynamic Queue Optimization & Center Management Portal API (Ministry of Consumer Affairs)",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1 Router
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }
