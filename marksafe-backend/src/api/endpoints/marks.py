"""Mark Events API — append-only hash-chained mark ledger."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...core.database import get_db
from ...models.core import MarkEvent, Script
from ...schemas import MarkEventCreate, MarkEventOut
from ...services.hash_chain import create_mark_event

router = APIRouter()


@router.post("/", response_model=MarkEventOut, status_code=201)
async def submit_mark(
    payload: MarkEventCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a mark for a question. Hash-chained to previous event."""
    # Verify script exists
    result = await db.execute(
        select(Script).filter(Script.id == payload.script_id)
    )
    script = result.scalars().first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    event = await create_mark_event(
        db=db,
        script_id=payload.script_id,
        question_id=payload.question_id,
        examiner_id=payload.examiner_id,
        mark=payload.mark,
        reason=payload.reason,
    )
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/script/{script_id}", response_model=list[MarkEventOut])
async def get_marks_for_script(
    script_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all mark events for a script, ordered chronologically."""
    result = await db.execute(
        select(MarkEvent)
        .filter(MarkEvent.script_id == script_id)
        .order_by(MarkEvent.created_at)
    )
    return result.scalars().all()
