import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.msp_rate import MSPRate
from app.schemas.msp_schema import MSPRateCreateRequest
from app.websocket_manager import manager


def parse_uuid_or_none(val: Optional[str]) -> Optional[uuid.UUID]:
    """Helper to safely parse UUID strings."""
    if not val:
        return None
    try:
        return uuid.UUID(val)
    except (ValueError, TypeError):
        return None


async def create_or_update_msp_rate(
    db: AsyncSession, payload: MSPRateCreateRequest, user_id: str
) -> MSPRate:
    """
    Creates or updates global MSP rate for a crop, broadcasts live updates universally,
    and updates moisture limits.
    """
    effective_date = payload.effective_from or date.today()
    updater_uuid = parse_uuid_or_none(user_id)

    stmt = select(MSPRate).where(MSPRate.crop_name == payload.crop_name)
    result = await db.execute(stmt)
    existing_msp = result.scalar_one_or_none()

    if existing_msp:
        existing_msp.rate_per_quintal = payload.rate_per_quintal
        if payload.permitted_moisture_percent is not None:
            existing_msp.permitted_moisture_percent = payload.permitted_moisture_percent
        if payload.max_rejection_moisture_percent is not None:
            existing_msp.max_rejection_moisture_percent = payload.max_rejection_moisture_percent
        existing_msp.effective_from = effective_date
        existing_msp.updated_by = updater_uuid
        msp = existing_msp
    else:
        msp = MSPRate(
            id=uuid.uuid4(),
            crop_name=payload.crop_name,
            rate_per_quintal=payload.rate_per_quintal,
            permitted_moisture_percent=payload.permitted_moisture_percent or 14.0,
            max_rejection_moisture_percent=payload.max_rejection_moisture_percent or 16.0,
            effective_from=effective_date,
            updated_by=updater_uuid,
        )
        db.add(msp)

    await db.commit()
    await db.refresh(msp)

    return msp


async def get_active_msp_rates(
    db: AsyncSession, center_id: Optional[str] = None
) -> List[MSPRate]:
    """Retrieves all active global MSP rates across all crops."""
    stmt = select(MSPRate).order_by(MSPRate.crop_name.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())
