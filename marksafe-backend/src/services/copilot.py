"""Copilot Service — AI Integration layer (Mock).

Simulates the AI components from the implementation plan:
- ScanProof Agent: QC metrics (sharpness, contrast, rotation, holds)
- Rubric Copilot: JSON-schema driven evaluation
"""

import random
from typing import Dict, Any, List

async def scanproof_analyze_page(image_url: str) -> Dict[str, Any]:
    """Mock implementation of the ScanProof QC model.
    Returns metrics and potential red flags for a single page.
    """
    sharpness = random.uniform(60.0, 99.9)
    contrast = random.uniform(70.0, 99.9)
    
    # 5% chance of a scan issue
    is_red_flag = random.random() < 0.05
    issue = "Faint ink or blurred text detected." if is_red_flag else None
    
    return {
        "sharpness": sharpness,
        "contrast": contrast,
        "is_red_flag": is_red_flag,
        "issue": issue
    }


async def copilot_draft_evaluation(
    script_id: str,
    question_id: str,
    answer_text: str,
    rubric_criteria: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Mock implementation of the Rubric Copilot drafting a score.
    In reality, this would use an LLM with strict structured output.
    """
    # Simulate processing delay
    # await asyncio.sleep(1.5)
    
    # Generate mock evidence citations and scores based on rubric
    total_score = 0
    evidence = []
    
    for crit in rubric_criteria:
        # Simulate 85% chance of finding evidence for each criterion
        found = random.random() < 0.85
        if found:
            total_score += crit["marks"]
            evidence.append({
                "criterion_id": crit["id"],
                "found": True,
                "citation": "Mock cited text snippet from answer...",
                "score_awarded": crit["marks"]
            })
        else:
            evidence.append({
                "criterion_id": crit["id"],
                "found": False,
                "citation": None,
                "score_awarded": 0
            })
            
    confidence = random.uniform(82.0, 98.5)
    
    return {
        "suggested_score": total_score,
        "confidence": confidence,
        "evidence": evidence,
        "reasoning": f"Based on the rubric, {len([e for e in evidence if e['found']])} out of {len(rubric_criteria)} criteria were satisfied."
    }
