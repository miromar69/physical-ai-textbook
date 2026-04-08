from pydantic import BaseModel


class PersonalizeRequest(BaseModel):
    chapter_slug: str
    content: str


class PersonalizeResponse(BaseModel):
    chapter_slug: str
    personalized_content: str
    cached: bool
