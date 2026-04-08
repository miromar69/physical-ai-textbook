from qdrant_client import QdrantClient

from app.config import settings

qdrant_client = QdrantClient(
    url=settings.qdrant_url,
    api_key=settings.qdrant_api_key,
)
