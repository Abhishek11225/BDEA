import logging
from typing import List, Dict, Any, Optional

try:
    from paddleocr import PaddleOCR
    _OCR = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
except ImportError:
    logging.warning("PaddleOCR not installed. Using dummy service.")
    _OCR = None

class PaddleOCRService:
    """Service to handle document-level text detection and structure analysis using PaddleOCR."""
    
    @staticmethod
    def process_image(image_path_or_array) -> Dict[str, Any]:
        """
        Process an image and extract bounding boxes, text, and confidence.
        """
        if _OCR is None:
            # Fallback for systems without PaddleOCR installed (for development/stub)
            return {
                "blocks": [
                    {
                        "bbox": [[100, 100], [400, 100], [400, 150], [100, 150]],
                        "text": "Explain Newton's Second Law.",
                        "confidence": 0.98
                    },
                    {
                        "bbox": [[100, 200], [800, 200], [800, 300], [100, 300]],
                        "text": "Newton's second law states that force is equal to mass multiplied by acceleration. F = ma.",
                        "confidence": 0.65 # low confidence, would trigger TrOCR
                    }
                ],
                "average_confidence": 0.81
            }

        try:
            result = _OCR.ocr(image_path_or_array, cls=True)
            blocks = []
            total_conf = 0.0
            
            if not result or not result[0]:
                return {"blocks": [], "average_confidence": 0.0}

            for idx, line in enumerate(result[0]):
                bbox = line[0] # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                text = line[1][0]
                confidence = float(line[1][1])
                
                blocks.append({
                    "bbox": bbox,
                    "text": text,
                    "confidence": confidence
                })
                total_conf += confidence
                
            avg_conf = total_conf / len(blocks) if blocks else 0.0
            return {
                "blocks": blocks,
                "average_confidence": avg_conf
            }
            
        except Exception as e:
            logging.error(f"PaddleOCR processing failed: {str(e)}")
            raise e
