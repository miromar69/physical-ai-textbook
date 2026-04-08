from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.schemas.personalize import PersonalizeRequest, PersonalizeResponse
from app.services.auth_service import get_current_user
from app.services.personalize_service import personalize_content

router = APIRouter(prefix="/personalize", tags=["Personalize"])


@router.post("", response_model=PersonalizeResponse)
async def personalize_route(
    data: PersonalizeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your background profile first",
        )

    result = await personalize_content(
        db=db,
        profile=user.profile,
        chapter_slug=data.chapter_slug,
        content=data.content,
    )

    return PersonalizeResponse(
        chapter_slug=data.chapter_slug,
        personalized_content=result["personalized_content"],
        cached=result["cached"],
    )
