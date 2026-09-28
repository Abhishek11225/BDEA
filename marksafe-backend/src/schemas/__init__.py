"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────

class ScriptStateEnum(str, Enum):
    INGESTED = "INGESTED"
    QC_RUNNING = "QC_RUNNING"
    HELD_RESCAN = "HELD_RESCAN"
    READY = "READY"
    ALLOCATED = "ALLOCATED"
    IN_MARKING = "IN_MARKING"
    MARKED = "MARKED"
    GUARDIAN_CHECK = "GUARDIAN_CHECK"
    IN_REVIEW = "IN_REVIEW"
    MODERATION = "MODERATION"
    APPROVED = "APPROVED"
    LOCKED = "LOCKED"


class AlertSeverityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


# ── User ───────────────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    role: str


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: UUID
    is_active: bool

    model_config = {"from_attributes": True}


# ── Exam ───────────────────────────────────────────────────────

class ExamBase(BaseModel):
    name: str
    subject: str


class ExamCreate(ExamBase):
    pass


class ExamOut(ExamBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Script ─────────────────────────────────────────────────────

class ScriptBase(BaseModel):
    barcode: str
    exam_id: UUID


class ScriptCreate(ScriptBase):
    pass


class ScriptOut(ScriptBase):
    id: UUID
    state: ScriptStateEnum
    created_at: datetime

    model_config = {"from_attributes": True}


class ScriptDetail(ScriptOut):
    pages: List["PageOut"] = []
    mark_events: List["MarkEventOut"] = []
    alerts: List["AlertOut"] = []


# ── Page ───────────────────────────────────────────────────────

class PageBase(BaseModel):
    page_number: int
    image_url: str


class PageCreate(PageBase):
    script_id: UUID


class PageOut(PageBase):
    id: UUID
    script_id: UUID
    qc_score: Optional[float] = None
    is_red_flag: bool = False

    model_config = {"from_attributes": True}


# ── MarkEvent ──────────────────────────────────────────────────

class MarkEventCreate(BaseModel):
    """Examiner submits a mark for a question on a script."""
    script_id: UUID
    question_id: str
    examiner_id: UUID
    mark: float = Field(ge=0)
    reason: Optional[str] = None


class MarkEventOut(BaseModel):
    id: UUID
    script_id: UUID
    question_id: str
    examiner_id: UUID
    mark: float
    previous_hash: Optional[str] = None
    current_hash: str
    reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Alert ──────────────────────────────────────────────────────

class AlertCreate(BaseModel):
    script_id: UUID
    rule_id: str
    severity: AlertSeverityEnum
    message: str


class AlertResolve(BaseModel):
    resolved_by_id: UUID
    resolution_reason: str


class AlertOut(BaseModel):
    id: UUID
    script_id: UUID
    rule_id: str
    severity: AlertSeverityEnum
    message: str
    is_resolved: bool
    resolved_by_id: Optional[UUID] = None
    resolution_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Dashboard Stats ────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_assigned: int
    total_completed: int
    total_pending: int
    total_flagged: int


# ── Moderation Queue Item ──────────────────────────────────────

class ModerationQueueItem(BaseModel):
    script_id: UUID
    barcode: str
    exam_name: str
    severity: AlertSeverityEnum
    reason: str
    status: str


# Rebuild forward refs
ScriptDetail.model_rebuild()
