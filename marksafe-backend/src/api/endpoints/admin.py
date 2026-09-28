"""Users & Exams API."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from ...core.database import get_db
from ...models.core import User, Exam
from ...schemas import UserCreate, UserOut, ExamCreate, ExamOut

router = APIRouter()


# ── Users ──────────────────────────────────────────────────────

@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new examiner/moderator."""
    user = User(username=payload.username, role=payload.role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/users", response_model=list[UserOut])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Exams ──────────────────────────────────────────────────────

@router.post("/exams", response_model=ExamOut, status_code=201)
async def create_exam(
    payload: ExamCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new examination."""
    exam = Exam(name=payload.name, subject=payload.subject)
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.get("/exams", response_model=list[ExamOut])
async def list_exams(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exam))
    return result.scalars().all()


@router.get("/exams/{exam_id}", response_model=ExamOut)
async def get_exam(exam_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exam).filter(Exam.id == exam_id))
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam
