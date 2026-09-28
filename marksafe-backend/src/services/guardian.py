"""Guardian safety rules engine.

Implements the core safety checks described in the implementation plan:
- R1: Unmarked question detection
- R2: AI/Human score mismatch beyond threshold
- R3: Borderline grade-boundary detection
- R4: Examiner consistency drift
"""

from uuid import UUID
from typing import List, Optional
from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..models.core import Alert, AlertSeverity, MarkEvent, Script


@dataclass
class GuardianResult:
    triggered: bool
    rule_id: str
    severity: str
    message: str


async def check_score_mismatch(
    db: AsyncSession,
    script_id: UUID,
    question_id: str,
    ai_score: float,
    human_score: float,
    threshold: float = 1.0,
) -> Optional[GuardianResult]:
    """R2: Flag if AI and human scores disagree by more than threshold."""
    delta = abs(ai_score - human_score)
    if delta > threshold:
        return GuardianResult(
            triggered=True,
            rule_id="R2_SCORE_MISMATCH",
            severity="HIGH",
            message=f"AI/Human mismatch on {question_id}: AI={ai_score}, Human={human_score}, Delta={delta}",
        )
    return None


async def check_borderline(
    db: AsyncSession,
    script_id: UUID,
    total_score: float,
    pass_mark: float,
    margin: float = 2.0,
) -> Optional[GuardianResult]:
    """R3: Flag scripts within ±margin of a grade boundary."""
    distance = abs(total_score - pass_mark)
    if distance <= margin:
        side = "above" if total_score >= pass_mark else "below"
        return GuardianResult(
            triggered=True,
            rule_id="R3_BORDERLINE",
            severity="CRITICAL" if distance <= 1 else "HIGH",
            message=f"Borderline: total={total_score}, pass={pass_mark}, {distance} marks {side} boundary",
        )
    return None


async def check_unmarked_questions(
    db: AsyncSession,
    script_id: UUID,
    expected_questions: List[str],
) -> Optional[GuardianResult]:
    """R1: Detect if any expected questions have no MarkEvent."""
    result = await db.execute(
        select(MarkEvent.question_id)
        .filter(MarkEvent.script_id == script_id)
        .distinct()
    )
    marked = {row for row in result.scalars().all()}
    missing = [q for q in expected_questions if q not in marked]

    if missing:
        return GuardianResult(
            triggered=True,
            rule_id="R1_UNMARKED",
            severity="CRITICAL",
            message=f"Unmarked questions detected: {', '.join(missing)}",
        )
    return None


async def check_examiner_drift(
    db: AsyncSession,
    examiner_id: UUID,
    current_avg: float,
    window_size: int = 20,
    drift_threshold: float = 1.5,
) -> Optional[GuardianResult]:
    """R4: Flag if examiner's recent average deviates from their overall average."""
    result = await db.execute(
        select(func.avg(MarkEvent.mark))
        .filter(MarkEvent.examiner_id == examiner_id)
    )
    overall_avg = result.scalar_one_or_none()

    if overall_avg is not None:
        drift = abs(current_avg - float(overall_avg))
        if drift > drift_threshold:
            return GuardianResult(
                triggered=True,
                rule_id="R4_DRIFT",
                severity="MEDIUM",
                message=f"Examiner drift detected: recent avg={current_avg:.1f}, overall avg={float(overall_avg):.1f}, drift={drift:.1f}",
            )
    return None


async def persist_alert(
    db: AsyncSession,
    script_id: UUID,
    result: GuardianResult,
) -> Alert:
    """Persist a GuardianResult as an Alert record."""
    alert = Alert(
        script_id=script_id,
        rule_id=result.rule_id,
        severity=AlertSeverity(result.severity),
        message=result.message,
    )
    db.add(alert)
    await db.flush()
    return alert


async def run_all_checks(
    db: AsyncSession,
    script_id: UUID,
    question_id: str,
    ai_score: float,
    human_score: float,
    total_score: float,
    pass_mark: float,
    expected_questions: List[str],
    examiner_id: UUID,
    examiner_recent_avg: float,
) -> List[GuardianResult]:
    """Run all Guardian checks and persist any triggered alerts."""
    results: List[GuardianResult] = []

    checks = [
        await check_score_mismatch(db, script_id, question_id, ai_score, human_score),
        await check_borderline(db, script_id, total_score, pass_mark),
        await check_unmarked_questions(db, script_id, expected_questions),
        await check_examiner_drift(db, examiner_id, examiner_recent_avg),
    ]

    for check in checks:
        if check and check.triggered:
            await persist_alert(db, script_id, check)
            results.append(check)

    return results
