from pydantic import BaseModel


class TranslateRequest(BaseModel):
    chapter_slug: str
    content: str


class TranslateResponse(BaseModel):
    chapter_slug: str
    translated_content: str
    cached: bool
