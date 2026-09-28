import logging
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List
import io

from .paddleocr_service import PaddleOCRService
from .trocr_service import TrOCRService

# Confidence threshold below which we assume text is handwritten and needs TrOCR
HANDWRITING_CONFIDENCE_THRESHOLD = 0.85

class DocumentParser:
    """Coordinates document parsing using PaddleOCR for layout/printed text and TrOCR for handwriting."""
    
    @staticmethod
    def parse_page(image_bytes: bytes) -> Dict[str, Any]:
        """
        Parses a single page image.
        1. Preprocess image.
        2. Run PaddleOCR to detect blocks and read printed text.
        3. Identify low-confidence blocks (likely handwritten).
        4. Crop and pass to TrOCR.
        5. Return combined structured data.
        """
        # Load image with OpenCV for processing
        nparr = np.frombuffer(image_bytes, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_cv is None:
            raise ValueError("Invalid image bytes provided.")

        # Convert to PIL for TrOCR later
        img_pil = Image.open(io.BytesIO(image_bytes))

        # 1. Run PaddleOCR on the entire image
        paddle_result = PaddleOCRService.process_image(img_cv)
        
        final_blocks = []
        
        for block in paddle_result.get("blocks", []):
            confidence = block["confidence"]
            bbox = block["bbox"]
            text = block["text"]
            
            # Simple heuristic for Question/Answer classification
            # If it starts with Q or Question, classify as question. Otherwise, answer.
            block_type = "question" if text.strip().upper().startswith("Q") or "EXPLAIN" in text.upper() else "answer"
            
            # 2. If confidence is low, assume handwriting and route to TrOCR
            if confidence < HANDWRITING_CONFIDENCE_THRESHOLD:
                # Calculate bounding box coordinates
                # bbox is [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                x_coords = [p[0] for p in bbox]
                y_coords = [p[1] for p in bbox]
                
                # Expand crop slightly
                padding = 5
                x_min = max(0, int(min(x_coords)) - padding)
                y_min = max(0, int(min(y_coords)) - padding)
                x_max = min(img_pil.width, int(max(x_coords)) + padding)
                y_max = min(img_pil.height, int(max(y_coords)) + padding)
                
                try:
                    cropped_region = img_pil.crop((x_min, y_min, x_max, y_max))
                    trocr_text = TrOCRService.recognize_handwriting(cropped_region)
                    
                    final_blocks.append({
                        "type": block_type,
                        "text": trocr_text,
                        "bbox": bbox,
                        "confidence": confidence, # Note: TrOCR confidence would go here ideally
                        "recognition_engine": "trocr"
                    })
                except Exception as e:
                    logging.warning(f"TrOCR failed on region {bbox}: {e}. Falling back to PaddleOCR.")
                    final_blocks.append({
                        "type": block_type,
                        "text": text,
                        "bbox": bbox,
                        "confidence": confidence,
                        "recognition_engine": "paddleocr"
                    })
            else:
                final_blocks.append({
                    "type": block_type,
                    "text": text,
                    "bbox": bbox,
                    "confidence": confidence,
                    "recognition_engine": "paddleocr"
                })

        return {
            "page_confidence": paddle_result.get("average_confidence", 0.0),
            "blocks": final_blocks
        }
