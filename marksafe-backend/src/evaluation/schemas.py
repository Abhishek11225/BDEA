from typing import List, Optional
from pydantic import BaseModel

class EvaluatedCriterion(BaseModel):
    criterion: str
    marks_awarded: float
    max_marks: float
    status: str # "met", "partial", "missing"
    evidence: Optional[str]

class AIEvaluationResult(BaseModel):
    suggested_marks: float
    max_marks: float
    confidence: float
    overall_correct: bool
    criteria: List[EvaluatedCriterion]
    missing_points: List[str]
    mistakes: List[str]
    reasoning: str
