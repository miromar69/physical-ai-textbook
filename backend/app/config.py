from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # Qdrant
    qdrant_url: str
    qdrant_api_key: str

    # Groq
    groq_api_key: str

    # Better Auth
    better_auth_secret: str
    better_auth_url: str = "http://localhost:8000"

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
