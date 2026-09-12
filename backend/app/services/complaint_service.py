import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint import Complaint, ComplaintStatusEnum
from app.schemas.complaint_schema import ComplaintCreateRequest, ComplaintResolveRequest
from app.websocket_manager import manager
from app.services.msp_service import parse_uuid_or_none


async def generate_ticket_number(db: AsyncSession) -> str:
    """Generates unique grievance ticket number e.g. TKT-2026-0001."""
    stmt = select(func.count(Complaint.id))
    result = await db.execute(stmt)
    seq = (result.scalar_one() or 0) + 1
    return f"TKT-2026-{seq:04d}"


async def create_complaint(
    db: AsyncSession, farmer_id: str, payload: ComplaintCreateRequest
) -> Complaint:
    """Creates a new grievance ticket and broadcasts WebSocket alert to center admin."""
    ticket_num = await generate_ticket_number(db)
    now = datetime.now(timezone.utc)

    complaint = Complaint(
        id=uuid.uuid4(),
        ticket_number=ticket_num,
        farmer_id=uuid.UUID(farmer_id),
        center_id=uuid.UUID(payload.center_id),
        booking_id=parse_uuid_or_none(payload.booking_id),
        category=payload.category.value,
        subject=payload.subject,
        description=payload.description,
        status=ComplaintStatusEnum.OPEN.value,
        created_at=now,
        updated_at=now,
    )

    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)

    # Real-time WebSocket alert to center room
    await manager.broadcast_to_center(
        payload.center_id,
        {
            "event": "new_complaint",
            "ticket_number": complaint.ticket_number,
            "category": complaint.category,
            "center_id": payload.center_id,
        },
    )

    return complaint


async def get_center_complaints(
    db: AsyncSession, center_id: str, status_filter: Optional[str] = None
) -> List[Complaint]:
    """Retrieves complaints for a specific procurement center."""
    stmt = select(Complaint).where(Complaint.center_id == uuid.UUID(center_id))
    if status_filter:
        stmt = stmt.where(Complaint.status == status_filter)

    stmt = stmt.order_by(Complaint.created_at.desc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_farmer_complaints(
    db: AsyncSession, farmer_id: str
) -> List[Complaint]:
    """Retrieves all grievance tickets submitted by a specific farmer."""
    try:
        farmer_uuid = uuid.UUID(farmer_id)
    except (ValueError, TypeError):
        return []

    stmt = (
        select(Complaint)
        .where(Complaint.farmer_id == farmer_uuid)
        .order_by(Complaint.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def resolve_complaint(
    db: AsyncSession, complaint_id: str, user_id: str, payload: ComplaintResolveRequest
) -> Complaint:
    """Updates complaint resolution status and resolution notes."""
    stmt = select(Complaint).where(Complaint.id == uuid.UUID(complaint_id))
    result = await db.execute(stmt)
    complaint = result.scalar_one_or_none()

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Grievance ticket not found."
        )

    complaint.status = payload.status.value
    complaint.resolution_notes = payload.resolution_notes
    complaint.resolved_by = parse_uuid_or_none(user_id)
    complaint.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(complaint)

    return complaint
