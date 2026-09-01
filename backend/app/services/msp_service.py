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
    Creates or updates MSP rate for a crop, broadcasts live update via WebSockets to center,
    and dispatches background notifications.
    """
    effective_date = payload.effective_from or date.today()
    target_center_uuid = parse_uuid_or_none(payload.center_id)
    updater_uuid = parse_uuid_or_none(user_id)

    stmt = select(MSPRate).where(
        MSPRate.crop_name == payload.crop_name,
        MSPRate.center_id == target_center_uuid,
        MSPRate.effective_from == effective_date,
    )
    result = await db.execute(stmt)
    existing_msp = result.scalar_one_or_none()

    if existing_msp:
        existing_msp.rate_per_quintal = payload.rate_per_quintal
        existing_msp.updated_by = updater_uuid
        msp = existing_msp
    else:
        msp = MSPRate(
            id=uuid.uuid4(),
            crop_name=payload.crop_name,
            rate_per_quintal=payload.rate_per_quintal,
            center_id=target_center_uuid,
            effective_from=effective_date,
            updated_by=updater_uuid,
        )
        db.add(msp)

    await db.commit()
    await db.refresh(msp)

    # Real-time WebSocket broadcast to connected center clients
    if payload.center_id:
        await manager.broadcast_to_center(
            payload.center_id,
            {
                "event": "msp_updated",
                "crop_name": msp.crop_name,
                "rate_per_quintal": float(msp.rate_per_quintal),
                "center_id": payload.center_id,
            },
        )

    return msp


async def get_active_msp_rates(
    db: AsyncSession, center_id: Optional[str] = None
) -> List[MSPRate]:
    """Retrieves active MSP rates for global default or specified center."""
    target_center_uuid = parse_uuid_or_none(center_id)

    stmt = select(MSPRate).where(
        (MSPRate.center_id == target_center_uuid) | (MSPRate.center_id.is_(None))
    ).order_by(MSPRate.crop_name.asc(), MSPRate.effective_from.desc())

    result = await db.execute(stmt)
    return list(result.scalars().all())
