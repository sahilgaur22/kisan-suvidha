import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.center import Center
from app.schemas.center_schema import CenterCreateRequest, CenterResponse
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import require_roles, SUPER_ADMIN

router = APIRouter(prefix="/centers", tags=["Center Management"])


@router.get("", response_model=List[CenterResponse])
async def list_centers(
    state: Optional[str] = None,
    district: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Lists all active procurement centers filterable by state or district."""
    stmt = select(Center).where(Center.is_active.is_(True))

    if state:
        stmt = stmt.where(Center.state.ilike(f"%{state}%"))
    if district:
        stmt = stmt.where(Center.district.ilike(f"%{district}%"))

    stmt = stmt.order_by(Center.name.asc())
    result = await db.execute(stmt)
    centers = result.scalars().all()

    return [
        CenterResponse(
            id=str(c.id),
            name=c.name,
            code=c.code,
            state=c.state,
            district=c.district,
            address=c.address,
            max_daily_throughput=c.max_daily_throughput,
            avg_processing_minutes=c.avg_processing_minutes,
            latitude=float(c.latitude) if c.latitude is not None else None,
            longitude=float(c.longitude) if c.longitude is not None else None,
            is_active=c.is_active,
            created_at=c.created_at,
        )
        for c in centers
    ]


@router.post("", response_model=CenterResponse, status_code=status.HTTP_201_CREATED)
async def create_center(
    payload: CenterCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Creates a new procurement center (Super Admin only)."""
    if current_user.role != SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Super Admin can create centers.",
        )

    # Check code uniqueness
    existing_stmt = select(Center).where(Center.code == payload.code)
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Center with code '{payload.code}' already exists.",
        )

    center = Center(
        id=uuid.uuid4(),
        name=payload.name,
        code=payload.code,
        state=payload.state,
        district=payload.district,
        address=payload.address,
        max_daily_throughput=payload.max_daily_throughput,
        avg_processing_minutes=payload.avg_processing_minutes,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )

    db.add(center)
    await db.commit()
    await db.refresh(center)

    return CenterResponse(
        id=str(center.id),
        name=center.name,
        code=center.code,
        state=center.state,
        district=center.district,
        address=center.address,
        max_daily_throughput=center.max_daily_throughput,
        avg_processing_minutes=center.avg_processing_minutes,
        latitude=float(center.latitude) if center.latitude is not None else None,
        longitude=float(center.longitude) if center.longitude is not None else None,
        is_active=center.is_active,
        created_at=center.created_at,
    )


@router.get("/{center_id}", response_model=CenterResponse)
async def get_center_details(center_id: str, db: AsyncSession = Depends(get_db)):
    """Fetches details for a specific procurement center."""
    stmt = select(Center).where(Center.id == center_id)
    result = await db.execute(stmt)
    center = result.scalar_one_or_none()

    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Procurement center not found."
        )

    return CenterResponse(
        id=str(center.id),
        name=center.name,
        code=center.code,
        state=center.state,
        district=center.district,
        address=center.address,
        max_daily_throughput=center.max_daily_throughput,
        avg_processing_minutes=center.avg_processing_minutes,
        latitude=float(center.latitude) if center.latitude is not None else None,
        longitude=float(center.longitude) if center.longitude is not None else None,
        is_active=center.is_active,
        created_at=center.created_at,
    )
