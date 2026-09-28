import os
import logging
from typing import List

try:
    from openai import AsyncOpenAI
    _client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except ImportError:
    _client = None

class EmbeddingService:
    """Service to generate vector embeddings using OpenAI."""
    
    @staticmethod
    async def generate_embedding(text: str) -> List[float]:
        """Generate a 1536-dimensional vector for a given text."""
        if _client is None or not os.getenv("OPENAI_API_KEY"):
            # Dummy embedding for testing when API key is missing
            return [0.0] * 1536
            
        try:
            response = await _client.embeddings.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            logging.error(f"Failed to generate embedding: {e}")
            # Return dummy on failure to prevent total crash
            return [0.0] * 1536
