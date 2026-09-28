from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Dict, Any, Optional

from ..models.core import Question, MarkingScheme
from .embeddings import EmbeddingService

class RAGRetriever:
    """Retrieves semantic context for evaluation using pgvector."""
    
    @staticmethod
    async def get_evaluation_context(
        db: AsyncSession, 
        student_question_text: str
    ) -> Optional[Dict[str, Any]]:
        """
        1. Embed the extracted question text.
        2. Perform pgvector similarity search against Questions table.
        3. Retrieve full MarkingScheme (Rubric, References, Concepts).
        """
        # 1. Embed query
        query_embedding = await EmbeddingService.generate_embedding(student_question_text)
        
        # 2. Vector search (using L2 distance <->)
        # We order by distance and get the closest Question
        result = await db.execute(
            select(Question)
            .order_by(Question.embedding.l2_distance(query_embedding))
            .options(
                selectinload(Question.marking_scheme).selectinload(MarkingScheme.rubric_items),
                selectinload(Question.marking_scheme).selectinload(MarkingScheme.reference_answers),
                selectinload(Question.marking_scheme).selectinload(MarkingScheme.expected_concepts),
                selectinload(Question.marking_scheme).selectinload(MarkingScheme.common_mistakes)
            )
            .limit(1)
        )
        
        question = result.scalars().first()
        
        if not question or not question.marking_scheme:
            # Fallback if DB is empty or no scheme found
            return None
            
        scheme = question.marking_scheme
        
        return {
            "question": {
                "id": str(question.id),
                "question_number": question.question_number,
                "text": question.question_text,
                "max_marks": question.max_marks
            },
            "rubric": [
                {"criterion": r.criterion, "marks": r.marks} 
                for r in scheme.rubric_items
            ],
            "reference_answers": [
                r.answer_text for r in scheme.reference_answers
            ],
            "expected_concepts": [
                c.concept for c in scheme.expected_concepts
            ],
            "common_mistakes": [
                {"mistake": m.mistake_description, "penalty": m.penalty_marks}
                for m in scheme.common_mistakes
            ]
        }
