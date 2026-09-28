import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

from .schemas import AIEvaluationResult

try:
    from openai import AsyncOpenAI
    _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except ImportError:
    _client = None


class AIProvider(ABC):
    @abstractmethod
    async def evaluate(self, prompt: str, system_message: str) -> AIEvaluationResult:
        pass


class OpenAIProvider(AIProvider):
    async def evaluate(self, prompt: str, system_message: str) -> AIEvaluationResult:
        if _client is None or not os.getenv("OPENAI_API_KEY"):
            # Dummy evaluation fallback
            logging.warning("OpenAI API not configured. Using dummy evaluation.")
            return AIEvaluationResult(
                suggested_marks=4.0,
                max_marks=5.0,
                confidence=0.92,
                overall_correct=True,
                criteria=[
                    {"criterion": "Definition", "marks_awarded": 1, "max_marks": 1, "status": "met", "evidence": "Newton's second law states..."},
                    {"criterion": "Formula", "marks_awarded": 1, "max_marks": 1, "status": "met", "evidence": "F = ma"},
                    {"criterion": "Explanation", "marks_awarded": 2, "max_marks": 2, "status": "met", "evidence": "force is equal to mass multiplied by acceleration"},
                    {"criterion": "Example", "marks_awarded": 0, "max_marks": 1, "status": "missing", "evidence": None}
                ],
                missing_points=["Practical example"],
                mistakes=[],
                reasoning="The student correctly defines the law, provides the formula, and explains the relationship, but does not provide the required example."
            )

        try:
            response = await _client.chat.completions.create(
                model="gpt-4o", # High capacity model for reasoning
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.1 # Keep it deterministic
            )
            
            content = response.choices[0].message.content
            data = json.loads(content)
            return AIEvaluationResult(**data)
            
        except Exception as e:
            logging.error(f"OpenAI evaluation failed: {e}")
            raise RuntimeError("AI evaluation temporarily unavailable.")
