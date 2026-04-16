# Physical AI & Humanoid Robotics Textbook

An AI-powered interactive textbook that teaches Physical AI and Humanoid Robotics through 4 modules and 9 chapters — with a RAG chatbot, adaptive content personalization, and Urdu translation.

**[Live Demo](https://physical-ai-textbook-bay.vercel.app/)** | **[API Docs](https://miromar69-physical-ai-textbook-api.hf.space/docs)** | **[API Health](https://miromar69-physical-ai-textbook-api.hf.space/health)**

---

## What It Does

| Feature | How It Works |
|---------|-------------|
| **AI Teaching Assistant** | RAG pipeline — embeds textbook chapters into Qdrant vectors, retrieves relevant chunks per question, generates answers via Llama 3.3 70B on Groq |
| **Content Personalization** | User signs up with skill profile (Python, ROS, ML levels + hardware). LLM rewrites chapter content matched to their level — beginner gets more comments and analogies, advanced gets concise optimization notes |
| **Urdu Translation** | Full chapter translation with RTL layout. Code blocks stay LTR. Cached per content hash to avoid re-translating |
| **User Auth** | JWT session cookies with bcrypt hashing. Cross-origin (Vercel to HF Space) via SameSite=None + Secure |
| **Interactive Textbook** | 4 modules, 9 chapters covering ROS 2, Gazebo/Unity simulation, NVIDIA Isaac, and Vision-Language-Action models |

## Architecture

```
                    Vercel                          Hugging Face Spaces
              +-----------------+              +------------------------+
  User -----> | Docusaurus 3    | -- REST ----> | FastAPI (Python 3.11)  |
              | React 18 + TS   |    API        |                        |
              | MDX content     |               |  Groq (Llama 3.3 70B) |
              +-----------------+               |  SentenceTransformers  |
                                                |  Qdrant Cloud (vectors)|
                                                |  Neon Postgres (data)  |
                                                +------------------------+
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Docusaurus 3, React 18, TypeScript, MDX |
| Backend | FastAPI, Python 3.11, SQLAlchemy (async), Alembic |
| Database | Neon Serverless Postgres (asyncpg) |
| Vector Store | Qdrant Cloud |
| LLM | Groq API (Llama 3.3 70B Versatile) |
| Embeddings | SentenceTransformers (all-MiniLM-L6-v2, local) |
| Auth | JWT session cookies (bcrypt + PyJWT) |
| Deployment | Vercel (frontend), Hugging Face Spaces Docker (backend) |

## Key Technical Decisions

- **Groq over OpenAI** — Free tier, fast inference, no billing required for a hackathon project
- **SentenceTransformers over API embeddings** — Runs locally inside the Docker container, zero cost, no API dependency for vector generation
- **Qdrant over pgvector** — Purpose-built vector DB with payload filtering (filter by chapter_slug), faster similarity search
- **Neon Postgres** — Serverless, scales to zero, free tier with generous limits
- **Cross-origin cookie auth** — SameSite=None + Secure to support Vercel frontend talking to HF Space backend

## Project Structure

```
frontend/                    # Docusaurus 3 site
  docs/                      # MDX chapter content (4 modules, 9 chapters)
  src/components/            # ChatPanel, PersonalizeButton, TranslateButton
  src/contexts/              # AuthContext (JWT cookie session management)
  src/services/              # API client
  src/theme/                 # Swizzled DocItem/Layout, Root, NavbarItem

backend/                     # FastAPI backend
  app/api/                   # Route handlers (auth, chat, profile, personalize, translate)
  app/services/              # RAG pipeline, embedding indexer, personalization, translation
  app/models/                # SQLAlchemy models (User, Conversation, Cache)
  app/schemas/               # Pydantic request/response validation
  Dockerfile                 # HF Spaces deployment (port 7860)

specs/                       # Architecture docs, OpenAPI spec, data model
```

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- [Neon](https://neon.tech) Postgres database (free tier)
- [Qdrant Cloud](https://cloud.qdrant.io) cluster (free tier)
- [Groq](https://console.groq.com) API key (free tier)

### Frontend

```bash
cd frontend
npm install
npm run start          # http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # Add your credentials
alembic upgrade head         # Run migrations
python -m app.services.embedding_service   # Index chapters into Qdrant (one-time)
uvicorn app.main:app --reload --port 8000  # http://localhost:8000/docs
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

## Curriculum

1. **The Robotic Nervous System** — ROS 2 Foundations and Advanced Topics
2. **The Digital Twin** — Gazebo Simulation, Unity Digital Twin, Sim-to-Real Transfer
3. **The AI-Robot Brain** — NVIDIA Isaac Sim Fundamentals and Manipulation
4. **Vision-Language-Action Models** — VLA Architecture, Training & Deployment

## Author

**Umer Zulfiqar** — [GitHub](https://github.com/miromar69)

## License

Copyright 2026 Umer Zulfiqar. All rights reserved.
