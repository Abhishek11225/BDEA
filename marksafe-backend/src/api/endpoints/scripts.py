"""Scripts API — core evaluation endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from ...core.database import get_db
from ...models.core import Script, ScriptState
from ...schemas import ScriptCreate, ScriptOut, ScriptDetail
from ...services.hash_chain import verify_chain

router = APIRouter()


@router.get("/", response_model=list[ScriptOut])
async def list_scripts(
    state: ScriptState | None = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List scripts with optional state filter."""
    query = select(Script).offset(offset).limit(limit)
    if state:
        query = query.filter(Script.state == state)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=ScriptOut, status_code=201)
async def create_script(
    payload: ScriptCreate,
    db: AsyncSession = Depends(get_db),
):
    """Ingest a new script."""
    script = Script(
        barcode=payload.barcode,
        exam_id=payload.exam_id,
        state=ScriptState.INGESTED,
    )
    db.add(script)
    await db.commit()
    await db.refresh(script)
    return script


@router.get("/{script_id}", response_model=ScriptDetail)
async def get_script(
    script_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get full script detail including pages, marks, and alerts."""
    result = await db.execute(
        select(Script)
        .filter(Script.id == script_id)
        .options(
            selectinload(Script.pages),
            selectinload(Script.mark_events),
            selectinload(Script.alerts),
        )
    )
    script = result.scalars().first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return script


@router.patch("/{script_id}/state", response_model=ScriptOut)
async def update_script_state(
    script_id: UUID,
    new_state: ScriptState,
    db: AsyncSession = Depends(get_db),
):
    """Transition a script to a new state (validates allowed transitions)."""
    result = await db.execute(select(Script).filter(Script.id == script_id))
    script = result.scalars().first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    # State machine validation
    allowed_transitions = {
        ScriptState.INGESTED: {ScriptState.QC_RUNNING},
        ScriptState.QC_RUNNING: {ScriptState.HELD_RESCAN, ScriptState.READY},
        ScriptState.HELD_RESCAN: {ScriptState.QC_RUNNING},
        ScriptState.READY: {ScriptState.ALLOCATED},
        ScriptState.ALLOCATED: {ScriptState.IN_MARKING},
        ScriptState.IN_MARKING: {ScriptState.MARKED},
        ScriptState.MARKED: {ScriptState.GUARDIAN_CHECK},
        ScriptState.GUARDIAN_CHECK: {ScriptState.IN_REVIEW, ScriptState.MODERATION},
        ScriptState.IN_REVIEW: {ScriptState.APPROVED, ScriptState.MODERATION},
        ScriptState.MODERATION: {ScriptState.APPROVED, ScriptState.IN_MARKING},
        ScriptState.APPROVED: {ScriptState.LOCKED},
    }

    current = script.state
    if new_state not in allowed_transitions.get(current, set()):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from {current.value} to {new_state.value}",
        )

    script.state = new_state
    await db.commit()
    await db.refresh(script)
    return script


@router.get("/{script_id}/verify-chain")
async def verify_script_chain(
    script_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Verify the hash chain integrity for a script's mark events."""
    is_valid = await verify_chain(db, script_id)
    return {"script_id": str(script_id), "chain_valid": is_valid}
