from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, SigninRequest, SignupRequest, UserResponse
from app.services.auth_service import (
    SESSION_COOKIE,
    TOKEN_EXPIRY_HOURS,
    create_session_token,
    get_current_user,
    signin,
    signup,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup_route(
    data: SignupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await signup(db, data)
    token = create_session_token(user.id)
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="none",
        max_age=TOKEN_EXPIRY_HOURS * 3600,
        secure=True,
    )
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Account created successfully",
    )


@router.post("/signin", response_model=AuthResponse)
async def signin_route(
    data: SigninRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await signin(db, data.email, data.password)
    token = create_session_token(user.id)
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="none",
        max_age=TOKEN_EXPIRY_HOURS * 3600,
        secure=True,
    )
    return AuthResponse(
        user=UserResponse.model_validate(user),
        message="Signed in successfully",
    )


@router.post("/signout")
async def signout_route(response: Response):
    response.delete_cookie(key=SESSION_COOKIE)
    return {"message": "Signed out successfully"}


@router.get("/me", response_model=UserResponse)
async def me_route(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
