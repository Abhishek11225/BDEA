"""Alerts & Moderation API."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...core.database import get_db
from ...models.core import Alert, AlertSeverity
from ...schemas import AlertCreate, AlertOut, AlertResolve

router = APIRouter()


@router.get("/", response_model=list[AlertOut])
async def list_alerts(
    severity: AlertSeverity | None = None,
    resolved: bool | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List alerts with optional filters for severity and resolution status."""
    query = select(Alert).offset(offset).limit(limit).order_by(Alert.created_at.desc())
    if severity:
        query = query.filter(Alert.severity == severity)
    if resolved is not None:
        query = query.filter(Alert.is_resolved == resolved)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/script/{script_id}", response_model=list[AlertOut])
async def get_alerts_for_script(
    script_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all alerts for a specific script."""
    result = await db.execute(
        select(Alert)
        .filter(Alert.script_id == script_id)
        .order_by(Alert.created_at.desc())
    )
    return result.scalars().all()


@router.post("/", response_model=AlertOut, status_code=201)
async def create_alert(
    payload: AlertCreate,
    db: AsyncSession = Depends(get_db),
):
    """Manually create an alert (typically done by Guardian service)."""
    alert = Alert(
        script_id=payload.script_id,
        rule_id=payload.rule_id,
        severity=payload.severity,
        message=payload.message,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
async def resolve_alert(
    alert_id: UUID,
    payload: AlertResolve,
    db: AsyncSession = Depends(get_db),
):
    """Mark an alert as resolved by a moderator."""
    result = await db.execute(select(Alert).filter(Alert.id == alert_id))
    alert = result.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    if alert.is_resolved:
        raise HTTPException(status_code=400, detail="Alert already resolved")

    alert.is_resolved = True
    alert.resolved_by_id = payload.resolved_by_id
    alert.resolution_reason = payload.resolution_reason
    await db.commit()
    await db.refresh(alert)
    return alert
