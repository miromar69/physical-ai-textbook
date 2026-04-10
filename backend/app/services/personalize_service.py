"""Personalization service: adapt chapter content to user's background profile."""

import hashlib
from datetime import datetime, timedelta, timezone

from groq import Groq
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.cache import PersonalizationCache
from app.models.user import BackgroundProfile

groq_client = Groq(api_key=settings.groq_api_key)

CACHE_TTL_DAYS = 7
LLM_MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are an expert robotics educator adapting textbook content for a specific student.

Student background:
- Python: {python_level}
- ROS 2: {ros_level}
- ML/AI: {ml_ai_level}
- Simulation: {simulation_level}
- Has GPU: {has_gpu}
- Has robot kit: {has_robot_kit}
- Has sensors: {has_sensors}

Adaptation rules:
- For BEGINNER skills: add more inline comments to code, explain jargon, include analogies, add "Why this matters" callouts.
- For INTERMEDIATE skills: keep the content mostly as-is, add practical tips and common pitfalls.
- For ADVANCED skills: make content more concise, add advanced optimization notes, reference papers/docs.
- If the student lacks hardware (no GPU/robot/sensors): suggest simulation alternatives and cloud resources.
- Preserve all Markdown formatting, headings, and code block structure.
- Do NOT remove any content — only adapt the explanation depth and add/reduce commentary.
- Return valid Markdown."""


def compute_profile_hash(profile: BackgroundProfile) -> str:
    """Compute a deterministic hash of the profile for cache keying."""
    key = (
        f"{profile.python_level.value}:"
        f"{profile.ros_level.value}:"
        f"{profile.ml_ai_level.value}:"
        f"{profile.simulation_level.value}:"
        f"{profile.has_gpu}:{profile.has_robot_kit}:{profile.has_sensors}"
    )
    return hashlib.sha256(key.encode()).hexdigest()


async def get_cached(
    db: AsyncSession, chapter_slug: str, profile_hash: str
) -> str | None:
    """Look up cached personalized content."""
    result = await db.execute(
        select(PersonalizationCache).where(
            PersonalizationCache.chapter_slug == chapter_slug,
            PersonalizationCache.profile_hash == profile_hash,
            PersonalizationCache.expires_at > datetime.now(timezone.utc),
        )
    )
    cached = result.scalar_one_or_none()
    return cached.personalized_content if cached else None


async def store_cache(
    db: AsyncSession, chapter_slug: str, profile_hash: str, content: str
) -> None:
    """Store personalized content in cache."""
    entry = PersonalizationCache(
        chapter_slug=chapter_slug,
        profile_hash=profile_hash,
        personalized_content=content,
        expires_at=datetime.now(timezone.utc) + timedelta(days=CACHE_TTL_DAYS),
    )
    db.add(entry)
    await db.commit()


async def personalize_content(
    db: AsyncSession,
    profile: BackgroundProfile,
    chapter_slug: str,
    content: str,
) -> dict:
    """Personalize chapter content based on user profile, with caching."""
    profile_hash = compute_profile_hash(profile)

    # Check cache
    cached = await get_cached(db, chapter_slug, profile_hash)
    if cached:
        return {"personalized_content": cached, "cached": True}

    # Build prompt
    system = SYSTEM_PROMPT.format(
        python_level=profile.python_level.value,
        ros_level=profile.ros_level.value,
        ml_ai_level=profile.ml_ai_level.value,
        simulation_level=profile.simulation_level.value,
        has_gpu=profile.has_gpu,
        has_robot_kit=profile.has_robot_kit,
        has_sensors=profile.has_sensors,
    )

    completion = groq_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Adapt this chapter content:\n\n{content}"},
        ],
        max_tokens=4000,
        temperature=0.4,
    )

    personalized = completion.choices[0].message.content or content

    # Store in cache
    await store_cache(db, chapter_slug, profile_hash, personalized)

    return {"personalized_content": personalized, "cached": False}
