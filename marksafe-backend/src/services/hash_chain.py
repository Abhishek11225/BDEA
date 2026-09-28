"""Hash-chaining service for immutable MarkEvent ledger."""

import hashlib
import json
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc

from ..models.core import MarkEvent


def _compute_hash(
    script_id: UUID,
    question_id: str,
    examiner_id: UUID,
    mark: float,
    previous_hash: Optional[str],
    timestamp: str,
) -> str:
    """Deterministic SHA-256 hash of the mark event payload."""
    payload = json.dumps(
        {
            "script_id": str(script_id),
            "question_id": question_id,
            "examiner_id": str(examiner_id),
            "mark": mark,
            "previous_hash": previous_hash or "GENESIS",
            "timestamp": timestamp,
        },
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode()).hexdigest()


async def get_latest_hash(db: AsyncSession, script_id: UUID) -> Optional[str]:
    """Get the most recent hash for a script's mark chain."""
    result = await db.execute(
        select(MarkEvent.current_hash)
        .filter(MarkEvent.script_id == script_id)
        .order_by(desc(MarkEvent.created_at))
        .limit(1)
    )
    row = result.scalar_one_or_none()
    return row


async def create_mark_event(
    db: AsyncSession,
    script_id: UUID,
    question_id: str,
    examiner_id: UUID,
    mark: float,
    reason: Optional[str] = None,
) -> MarkEvent:
    """Create a new hash-chained MarkEvent (append-only)."""
    previous_hash = await get_latest_hash(db, script_id)
    now = datetime.utcnow()

    current_hash = _compute_hash(
        script_id=script_id,
        question_id=question_id,
        examiner_id=examiner_id,
        mark=mark,
        previous_hash=previous_hash,
        timestamp=now.isoformat(),
    )

    event = MarkEvent(
        id=uuid4(),
        script_id=script_id,
        question_id=question_id,
        examiner_id=examiner_id,
        mark=mark,
        previous_hash=previous_hash,
        current_hash=current_hash,
        reason=reason,
        created_at=now,
    )
    db.add(event)
    await db.flush()
    return event


async def verify_chain(db: AsyncSession, script_id: UUID) -> bool:
    """Verify the integrity of the hash chain for a script.
    Returns True if the chain is unbroken.
    """
    result = await db.execute(
        select(MarkEvent)
        .filter(MarkEvent.script_id == script_id)
        .order_by(MarkEvent.created_at)
    )
    events = result.scalars().all()

    prev_hash = None
    for event in events:
        expected = _compute_hash(
            script_id=event.script_id,
            question_id=event.question_id,
            examiner_id=event.examiner_id,
            mark=event.mark,
            previous_hash=prev_hash,
            timestamp=event.created_at.isoformat(),
        )
        if event.current_hash != expected:
            return False
        if event.previous_hash != prev_hash:
            return False
        prev_hash = event.current_hash

    return True
