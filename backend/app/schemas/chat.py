import uuid

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(max_length=2000)
    conversation_id: uuid.UUID | None = None
    chapter_slug: str | None = None
    selected_text: str | None = Field(default=None, max_length=5000)


class ChatSource(BaseModel):
    chapter_slug: str
    heading: str
    snippet: str


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message: str
    sources: list[ChatSource]
