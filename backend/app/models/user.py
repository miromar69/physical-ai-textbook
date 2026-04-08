import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class SkillLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    profile: Mapped["BackgroundProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class BackgroundProfile(Base):
    __tablename__ = "background_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )
    python_level: Mapped[SkillLevel] = mapped_column(
        Enum(SkillLevel), nullable=False
    )
    ros_level: Mapped[SkillLevel] = mapped_column(
        Enum(SkillLevel), nullable=False
    )
    ml_ai_level: Mapped[SkillLevel] = mapped_column(
        Enum(SkillLevel), nullable=False
    )
    simulation_level: Mapped[SkillLevel] = mapped_column(
        Enum(SkillLevel), nullable=False
    )
    has_gpu: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_robot_kit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_sensors: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="profile")
