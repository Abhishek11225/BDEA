import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Float, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import enum
from pgvector.sqlalchemy import Vector
from ..core.database import Base

class ScriptState(str, enum.Enum):
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

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False)  # e.g., EXAMINER, MODERATOR
    is_active = Column(Boolean, default=True)

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=True)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    questions = relationship("Question", back_populates="exam")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    question_number = Column(String, nullable=False) # e.g., "Q4" or "Q1(a)"
    question_text = Column(Text, nullable=False)
    max_marks = Column(Float, nullable=False)
    
    # Vector embedding of the question text for semantic retrieval
    embedding = Column(Vector(1536), nullable=True) 

    exam = relationship("Exam", back_populates="questions")
    marking_scheme = relationship("MarkingScheme", back_populates="question", uselist=False)

class MarkingScheme(Base):
    __tablename__ = "marking_schemes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    
    question = relationship("Question", back_populates="marking_scheme")
    rubric_items = relationship("RubricItem", back_populates="marking_scheme")
    reference_answers = relationship("ReferenceAnswer", back_populates="marking_scheme")
    expected_concepts = relationship("ExpectedConcept", back_populates="marking_scheme")
    common_mistakes = relationship("CommonMistake", back_populates="marking_scheme")

class RubricItem(Base):
    __tablename__ = "rubric_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    marking_scheme_id = Column(UUID(as_uuid=True), ForeignKey("marking_schemes.id"), nullable=False)
    criterion = Column(Text, nullable=False)
    marks = Column(Float, nullable=False)
    
    embedding = Column(Vector(1536), nullable=True)
    
    marking_scheme = relationship("MarkingScheme", back_populates="rubric_items")

class ReferenceAnswer(Base):
    __tablename__ = "reference_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    marking_scheme_id = Column(UUID(as_uuid=True), ForeignKey("marking_schemes.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    
    embedding = Column(Vector(1536), nullable=True)
    
    marking_scheme = relationship("MarkingScheme", back_populates="reference_answers")

class ExpectedConcept(Base):
    __tablename__ = "expected_concepts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    marking_scheme_id = Column(UUID(as_uuid=True), ForeignKey("marking_schemes.id"), nullable=False)
    concept = Column(Text, nullable=False)
    
    embedding = Column(Vector(1536), nullable=True)
    
    marking_scheme = relationship("MarkingScheme", back_populates="expected_concepts")

class CommonMistake(Base):
    __tablename__ = "common_mistakes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    marking_scheme_id = Column(UUID(as_uuid=True), ForeignKey("marking_schemes.id"), nullable=False)
    mistake_description = Column(Text, nullable=False)
    penalty_marks = Column(Float, default=0.0)
    
    embedding = Column(Vector(1536), nullable=True)
    
    marking_scheme = relationship("MarkingScheme", back_populates="common_mistakes")

class Script(Base):
    __tablename__ = "scripts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    barcode = Column(String, unique=True, index=True, nullable=False)
    state = Column(Enum(ScriptState), default=ScriptState.INGESTED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    exam = relationship("Exam")
    pages = relationship("Page", back_populates="script")
    mark_events = relationship("MarkEvent", back_populates="script")
    alerts = relationship("Alert", back_populates="script")

class Page(Base):
    __tablename__ = "pages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    script_id = Column(UUID(as_uuid=True), ForeignKey("scripts.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_url = Column(String, nullable=False)
    qc_score = Column(Float, nullable=True)
    is_red_flag = Column(Boolean, default=False)
    
    # Store OCR blocks extracted from the page
    ocr_confidence = Column(Float, nullable=True)
    ocr_blocks = Column(JSONB, nullable=True) 
    
    script = relationship("Script", back_populates="pages")
    extracted_answers = relationship("ExtractedAnswer", back_populates="page")

class ExtractedAnswer(Base):
    """Answers extracted from a specific page via OCR."""
    __tablename__ = "extracted_answers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey("pages.id"), nullable=False)
    question_number = Column(String, nullable=True) 
    answer_text = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    bbox = Column(JSONB, nullable=True)
    recognition_engine = Column(String, nullable=True)
    
    page = relationship("Page", back_populates="extracted_answers")

class MarkEvent(Base):
    __tablename__ = "mark_events"
    # Note: Append-only with DB triggers for hashing in production
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    script_id = Column(UUID(as_uuid=True), ForeignKey("scripts.id"), nullable=False)
    question_id = Column(String, nullable=False)  # ID or label like Q1(a)
    examiner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    mark = Column(Float, nullable=False)
    
    # AI Evaluation Metadata
    ai_suggested_mark = Column(Float, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_reasoning = Column(Text, nullable=True)
    ai_evidence = Column(JSONB, nullable=True)
    
    previous_hash = Column(String, nullable=True)
    current_hash = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    script = relationship("Script", back_populates="mark_events")

class AlertSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    script_id = Column(UUID(as_uuid=True), ForeignKey("scripts.id"), nullable=False)
    rule_id = Column(String, nullable=False)  # e.g., R1_UNMARKED
    severity = Column(Enum(AlertSeverity), nullable=False)
    message = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolution_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    script = relationship("Script", back_populates="alerts")
