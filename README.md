# Physical AI & Humanoid Robotics Textbook

An interactive online textbook for Physical AI and Humanoid Robotics, featuring a RAG-powered AI teaching assistant, content personalization based on learner profiles, and Urdu translation with RTL support.

## Features

- **Interactive Textbook** — 4 modules, 9 chapters covering ROS 2, Gazebo/Unity simulation, NVIDIA Isaac Sim, and Vision-Language-Action models. Built with Docusaurus 3 and MDX.
- **AI Teaching Assistant** — RAG chatbot powered by OpenAI + Qdrant vector search. Ask questions about any chapter, or select text and ask contextually.
- **User Authentication** — Sign up with email/password and complete a background questionnaire (Python, ROS 2, ML/AI, simulation skill levels + hardware access).
- **Content Personalization** — Click "Personalize" on any chapter to get content adapted to your skill level. Cached per profile hash to reduce API costs.
- **Urdu Translation** — Click "Translate to Urdu" on any chapter. Prose translates to Urdu with RTL layout; code blocks stay in English. Cached per content hash.
- **GitHub Pages Deployment** — Static frontend deploys to GitHub Pages. Backend runs as a Docker container.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Docusaurus 3, React 18, TypeScript, MDX |
| Backend | FastAPI, Python 3.11+, SQLAlchemy (async) |
| Database | Neon Serverless Postgres |
| Vector Store | Qdrant Cloud |
| AI/LLM | OpenAI GPT-4o-mini, text-embedding-3-small |
| Auth | JWT session cookies (bcrypt + PyJWT) |
| CI/CD | GitHub Actions, Docker |

## Project Structure

```
frontend/                  # Docusaurus site
  docs/                    # MDX chapter content (4 modules, 9 chapters)
  src/components/          # ChatPanel, PersonalizeButton, TranslateButton, etc.
  src/contexts/            # AuthContext provider
  src/theme/               # Swizzled DocItem/Layout, Root, NavbarItem
backend/                   # FastAPI API
  app/api/                 # Route handlers (auth, chat, profile, personalize, translate)
  app/models/              # SQLAlchemy models (User, BackgroundProfile, Conversation, etc.)
  app/services/            # Business logic (auth, RAG, embedding, personalization, translation)
  app/schemas/             # Pydantic request/response schemas
specs/                     # Feature spec, architecture plan, tasks, data model, OpenAPI contract
```

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- A [Neon](https://neon.tech) Postgres database (free tier works)
- A [Qdrant Cloud](https://cloud.qdrant.io) cluster (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### Frontend

```bash
cd frontend
npm install
npm run start
```

Opens at `http://localhost:3000`.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your credentials
alembic upgrade head       # Run database migrations
uvicorn app.main:app --reload --port 8000
```

API docs at `http://localhost:8000/docs`.

### Index Chapter Embeddings (one-time)

```bash
cd backend
python -m app.services.embedding_service
```

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/signup` | Register with background profile | No |
| POST | `/auth/signin` | Sign in | No |
| POST | `/auth/signout` | Sign out | Yes |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/profile` | Get background profile | Yes |
| PUT | `/profile` | Update background profile | Yes |
| POST | `/chat/message` | Send message to RAG chatbot | Yes |
| POST | `/personalize` | Personalize chapter content | Yes |
| POST | `/translate` | Translate chapter to Urdu | No |
| GET | `/health` | Health check | No |

Full OpenAPI spec: [`specs/001-physical-ai-textbook/contracts/openapi.yaml`](specs/001-physical-ai-textbook/contracts/openapi.yaml)

## Modules

1. **The Robotic Nervous System** — ROS 2 Foundations and Advanced Topics
2. **The Digital Twin** — Gazebo Simulation, Unity Digital Twin, Sim-to-Real Transfer
3. **The AI-Robot Brain** — NVIDIA Isaac Sim Fundamentals and Manipulation
4. **Vision-Language-Action Models** — VLA Architecture, Training & Deployment

## Documentation

- [Feature Specification](specs/001-physical-ai-textbook/spec.md)
- [Architecture Plan](specs/001-physical-ai-textbook/plan.md)
- [Task Breakdown](specs/001-physical-ai-textbook/tasks.md)
- [Data Model](specs/001-physical-ai-textbook/data-model.md)
- [Quick Start Guide](specs/001-physical-ai-textbook/quickstart.md)

## License

Copyright 2026. All rights reserved.
