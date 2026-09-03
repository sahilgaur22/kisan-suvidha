from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.complaint_schema import (
    ComplaintCreateRequest, ComplaintResponse, ComplaintResolveRequest
)
from app.services.complaint_service import (
    create_complaint, get_center_complaints, resolve_complaint
)
from app.core.deps import get_current_user_context, CurrentUser
from app.core.rbac import verify_center_access, CENTER_ADMIN, SUPER_ADMIN

router = APIRouter(prefix="/complaints", tags=["Grievance & Resolution"])


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    payload: ComplaintCreateRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Farmer submits a new grievance ticket."""
    complaint = await create_complaint(db, farmer_id=current_user.user_id, payload=payload)

    return ComplaintResponse(
        id=str(complaint.id),
        ticket_number=complaint.ticket_number,
        farmer_id=str(complaint.farmer_id),
        center_id=str(complaint.center_id),
        booking_id=str(complaint.booking_id) if complaint.booking_id else None,
        category=complaint.category,
        description=complaint.description,
        status=complaint.status,
        resolution_notes=complaint.resolution_notes,
        resolved_by=str(complaint.resolved_by) if complaint.resolved_by else None,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
    )


@router.get("/center/{center_id}", response_model=List[ComplaintResponse])
async def list_center_complaints(
    center_id: str,
    status_filter: Optional[str] = None,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Center Admin Complaint Inbox: Routed exclusively to the center's admin (RLS-enforced).
    Ground staff handles physical token queue check-ins; grievance resolution is admin-only.
    """
    if current_user.role != CENTER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can access center grievance inbox.",
        )

    verify_center_access(
        user_role=current_user.role,
        user_center_id=current_user.center_id or "",
        target_center_id=center_id,
    )

    complaints = await get_center_complaints(db, center_id=center_id, status_filter=status_filter)

    return [
        ComplaintResponse(
            id=str(c.id),
            ticket_number=c.ticket_number,
            farmer_id=str(c.farmer_id),
            center_id=str(c.center_id),
            booking_id=str(c.booking_id) if c.booking_id else None,
            category=c.category,
            description=c.description,
            status=c.status,
            resolution_notes=c.resolution_notes,
            resolved_by=str(c.resolved_by) if c.resolved_by else None,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in complaints
    ]


@router.patch("/{complaint_id}/resolve", response_model=ComplaintResponse)
async def update_complaint_resolution(
    complaint_id: str,
    payload: ComplaintResolveRequest,
    current_user: CurrentUser = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """Center Admin updates ticket resolution status and notes."""
    if current_user.role not in [CENTER_ADMIN, SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only Center Admins can resolve grievance tickets.",
        )

    complaint = await resolve_complaint(
        db, complaint_id=complaint_id, user_id=current_user.user_id, payload=payload
    )

    return ComplaintResponse(
        id=str(complaint.id),
        ticket_number=complaint.ticket_number,
        farmer_id=str(complaint.farmer_id),
        center_id=str(complaint.center_id),
        booking_id=str(complaint.booking_id) if complaint.booking_id else None,
        category=complaint.category,
        description=complaint.description,
        status=complaint.status,
        resolution_notes=complaint.resolution_notes,
        resolved_by=str(complaint.resolved_by) if complaint.resolved_by else None,
        created_at=complaint.created_at,
        updated_at=complaint.updated_at,
    )
