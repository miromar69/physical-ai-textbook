"""Translation service: translate chapter prose to Urdu, preserving code blocks in English."""

import hashlib
import re

from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.cache import TranslationCache

openai_client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """You are an expert translator specializing in technical content translation from English to Urdu.

Rules:
- Translate all prose text to Urdu.
- Keep ALL code blocks exactly as they are in English — do not translate code.
- Keep technical terms (e.g., ROS 2, Gazebo, Python, NVIDIA, Isaac Sim, GPU, CUDA, API) in English.
- Preserve all Markdown formatting, headings structure, and code block delimiters.
- Use natural, readable Urdu — not machine-translated stiffness.
- Headings should be translated to Urdu.
- Return valid Markdown with the same structure as the input."""


def compute_content_hash(content: str) -> str:
    """SHA-256 hash of original content for cache invalidation."""
    return hashlib.sha256(content.encode()).hexdigest()


def split_prose_and_code(content: str) -> list[dict]:
    """Split content into prose and code segments."""
    segments = []
    parts = re.split(r"(```[\s\S]*?```)", content)

    for part in parts:
        if part.startswith("```"):
            segments.append({"type": "code", "content": part})
        elif part.strip():
            segments.append({"type": "prose", "content": part})

    return segments


def reassemble(segments: list[dict]) -> str:
    """Reassemble translated prose with original code blocks."""
    return "\n\n".join(seg["content"] for seg in segments)


async def get_cached(
    db: AsyncSession, chapter_slug: str, content_hash: str
) -> str | None:
    """Look up cached translation."""
    result = await db.execute(
        select(TranslationCache).where(
            TranslationCache.chapter_slug == chapter_slug,
            TranslationCache.content_hash == content_hash,
        )
    )
    cached = result.scalar_one_or_none()
    return cached.translated_content if cached else None


async def store_cache(
    db: AsyncSession, chapter_slug: str, content_hash: str, translated: str
) -> None:
    """Store translated content in cache."""
    entry = TranslationCache(
        chapter_slug=chapter_slug,
        content_hash=content_hash,
        translated_content=translated,
    )
    db.add(entry)
    await db.commit()


async def translate_content(
    db: AsyncSession,
    chapter_slug: str,
    content: str,
) -> dict:
    """Translate chapter content to Urdu with code preservation and caching."""
    content_hash = compute_content_hash(content)

    # Check cache
    cached = await get_cached(db, chapter_slug, content_hash)
    if cached:
        return {"translated_content": cached, "cached": True}

    # Split into prose and code
    segments = split_prose_and_code(content)

    # Collect prose segments for translation
    prose_parts = [seg["content"] for seg in segments if seg["type"] == "prose"]

    if prose_parts:
        prose_combined = "\n\n---SEGMENT_BREAK---\n\n".join(prose_parts)

        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        "Translate the following prose segments to Urdu. "
                        "Keep the ---SEGMENT_BREAK--- markers in place.\n\n"
                        f"{prose_combined}"
                    ),
                },
            ],
            max_tokens=4000,
            temperature=0.3,
        )

        translated_text = completion.choices[0].message.content or prose_combined
        translated_parts = translated_text.split("---SEGMENT_BREAK---")
        translated_parts = [p.strip() for p in translated_parts]

        # Reassemble with translated prose
        prose_idx = 0
        for seg in segments:
            if seg["type"] == "prose" and prose_idx < len(translated_parts):
                seg["content"] = translated_parts[prose_idx]
                prose_idx += 1

    translated = reassemble(segments)

    # Store in cache
    await store_cache(db, chapter_slug, content_hash, translated)

    return {"translated_content": translated, "cached": False}
