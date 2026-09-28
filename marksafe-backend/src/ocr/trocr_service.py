import logging
from PIL import Image

try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    import torch
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # Using the handwritten model
    _processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
    _model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten").to(device)
except ImportError:
    logging.warning("Transformers/PyTorch not installed. Using dummy TrOCR service.")
    _processor = None
    _model = None


class TrOCRService:
    """Service to handle handwritten text recognition using Microsoft TrOCR."""
    
    @staticmethod
    def recognize_handwriting(image: Image.Image) -> str:
        """
        Recognize handwritten text from a cropped image region.
        """
        if _model is None or _processor is None:
            # Fallback for systems without heavy ML dependencies
            return "Newton's second law states that force is equal to mass multiplied by acceleration. F = ma."
            
        try:
            # Ensure image is RGB
            if image.mode != "RGB":
                image = image.convert("RGB")
                
            pixel_values = _processor(image, return_tensors="pt").pixel_values.to(device)
            
            with torch.no_grad():
                generated_ids = _model.generate(pixel_values)
                
            generated_text = _processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            return generated_text
            
        except Exception as e:
            logging.error(f"TrOCR processing failed: {str(e)}")
            raise e
