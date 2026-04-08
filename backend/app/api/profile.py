from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.schemas.profile import BackgroundProfileResponse, BackgroundProfileUpdate
from app.services.auth_service import get_current_user, update_profile

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=BackgroundProfileResponse)
async def get_profile_route(user: User = Depends(get_current_user)):
    if not user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return BackgroundProfileResponse.model_validate(user.profile)


@router.put("", response_model=BackgroundProfileResponse)
async def update_profile_route(
    data: BackgroundProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    profile = await update_profile(db, user, data)
    return BackgroundProfileResponse.model_validate(profile)
