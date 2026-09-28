import json
from typing import Dict, Any

from .schemas import AIEvaluationResult
from .ai_provider import AIProvider, OpenAIProvider

SYSTEM_PROMPT = """You are an expert academic evaluator.
Your role is to evaluate a student's answer based STRICTLY on the provided Marking Scheme and Reference Context.
Do NOT invent your own criteria. Do NOT penalize the student for things outside the rubric.

You must return your evaluation as a strictly formatted JSON object matching this schema:
{
  "suggested_marks": float,
  "max_marks": float,
  "confidence": float (between 0.0 and 1.0),
  "overall_correct": boolean,
  "criteria": [
    {
      "criterion": string,
      "marks_awarded": float,
      "max_marks": float,
      "status": "met" | "partial" | "missing",
      "evidence": string (exact quote from student answer if found, else null)
    }
  ],
  "missing_points": [string],
  "mistakes": [string],
  "reasoning": string (brief overall explanation)
}
"""

class EvaluationService:
    def __init__(self, provider: AIProvider = OpenAIProvider()):
        self.provider = provider
        
    async def evaluate_answer(self, student_answer: str, rag_context: Dict[str, Any]) -> AIEvaluationResult:
        """
        Builds the prompt from the RAG context and student answer, then calls the AI provider.
        """
        question_data = rag_context.get("question", {})
        
        prompt = f"""
EVALUATION TASK:
----------------
Question: {question_data.get('text')}
Maximum Marks: {question_data.get('max_marks')}

MARKING SCHEME / RUBRIC:
------------------------
{json.dumps(rag_context.get('rubric'), indent=2)}

EXPECTED CONCEPTS:
------------------
{json.dumps(rag_context.get('expected_concepts'), indent=2)}

COMMON MISTAKES (Apply penalties if found):
-------------------------------------------
{json.dumps(rag_context.get('common_mistakes'), indent=2)}

STUDENT ANSWER:
---------------
"{student_answer}"

Evaluate the student answer now and return JSON.
"""
        return await self.provider.evaluate(prompt, SYSTEM_PROMPT)
