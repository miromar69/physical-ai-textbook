import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.db.database import get_db
from app.models.user import BackgroundProfile, User
from app.schemas.auth import SignupRequest
from app.schemas.profile import BackgroundProfileUpdate

SESSION_COOKIE = "session_token"
TOKEN_EXPIRY_HOURS = 72


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_session_token(user_id: uuid.UUID) -> str:
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.better_auth_secret, algorithm="HS256")


def decode_session_token(token: str) -> uuid.UUID | None:
    try:
        payload = jwt.decode(token, settings.better_auth_secret, algorithms=["HS256"])
        return uuid.UUID(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.email == email)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def signup(db: AsyncSession, data: SignupRequest) -> User:
    existing = await get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
    )
    db.add(user)
    await db.flush()

    profile = BackgroundProfile(
        user_id=user.id,
        python_level=data.profile.python_level,
        ros_level=data.profile.ros_level,
        ml_ai_level=data.profile.ml_ai_level,
        simulation_level=data.profile.simulation_level,
        has_gpu=data.profile.has_gpu,
        has_robot_kit=data.profile.has_robot_kit,
        has_sensors=data.profile.has_sensors,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(user)
    return user


async def signin(db: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)
    return user


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user_id = decode_session_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


async def update_profile(
    db: AsyncSession,
    user: User,
    data: BackgroundProfileUpdate,
) -> BackgroundProfile:
    profile = user.profile
    if not profile:
        profile = BackgroundProfile(user_id=user.id)
        db.add(profile)

    profile.python_level = data.python_level
    profile.ros_level = data.ros_level
    profile.ml_ai_level = data.ml_ai_level
    profile.simulation_level = data.simulation_level
    profile.has_gpu = data.has_gpu
    profile.has_robot_kit = data.has_robot_kit
    profile.has_sensors = data.has_sensors

    await db.commit()
    await db.refresh(profile)
    return profile
