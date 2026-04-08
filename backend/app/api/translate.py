from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.translate import TranslateRequest, TranslateResponse
from app.services.translate_service import translate_content

router = APIRouter(prefix="/translate", tags=["Translate"])


@router.post("", response_model=TranslateResponse)
async def translate_route(
    data: TranslateRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await translate_content(
        db=db,
        chapter_slug=data.chapter_slug,
        content=data.content,
    )

    return TranslateResponse(
        chapter_slug=data.chapter_slug,
        translated_content=result["translated_content"],
        cached=result["cached"],
    )
