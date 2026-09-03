from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.msp_schema import MSPRateCreateRequest, MSPRateResponse
from app.services.msp_service import create_or_update_msp_rate, get_active_msp_rates
from app.core.deps import get_current_user_context, CurrentUser

router = APIRouter(prefix="/msp", tags=["MSP Rate Management"])


@router.get("", response_model=List[MSPRateResponse])
async def read_msp_rates(
    center_id: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    """Retrieves current global Minimum Support Price (MSP) rates and moisture limits."""
    rates = await get_active_msp_rates(db, center_id=center_id)
    return [
        MSPRateResponse(
            id=str(r.id),
            crop_name=r.crop_name,
            rate_per_quintal=float(r.rate_per_quintal),
            permitted_moisture_percent=float(r.permitted_moisture_percent),
            max_rejection_moisture_percent=float(r.max_rejection_moisture_percent),
            effective_from=r.effective_from,
            updated_at=r.updated_at,
        )
        for r in rates
    ]


@router.post("", response_model=MSPRateResponse, status_code=status.HTTP_200_OK)
async def update_msp(
    payload: MSPRateCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates or updates global MSP rate for a crop.
    Updates moisture limits and MSP rates universally for all centers.
    """
    msp = await create_or_update_msp_rate(db, payload=payload, user_id=current_user.user_id)

    return MSPRateResponse(
        id=str(msp.id),
        crop_name=msp.crop_name,
        rate_per_quintal=float(msp.rate_per_quintal),
        permitted_moisture_percent=float(msp.permitted_moisture_percent),
        max_rejection_moisture_percent=float(msp.max_rejection_moisture_percent),
        effective_from=msp.effective_from,
        updated_at=msp.updated_at,
    )
