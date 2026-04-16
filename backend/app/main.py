from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    from app.db.database import engine

    async with engine.begin() as conn:
        await conn.execute(text("SELECT 1"))  # connection test
    yield
    await engine.dispose()


app = FastAPI(
    title="Physical AI Textbook API",
    version="1.0.0",
    description="Backend API for the Physical AI & Humanoid Robotics Textbook",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
from app.api.auth import router as auth_router  # noqa: E402
from app.api.chat import router as chat_router  # noqa: E402
from app.api.personalize import router as personalize_router  # noqa: E402
from app.api.profile import router as profile_router  # noqa: E402
from app.api.translate import router as translate_router  # noqa: E402

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(chat_router)
app.include_router(personalize_router)
app.include_router(translate_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0.0"}
