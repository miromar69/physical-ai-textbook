# Quickstart: Physical AI & Humanoid Robotics Textbook

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.11+
- Git
- A Neon Serverless Postgres database (free tier works)
- A Qdrant Cloud cluster (free tier works)
- An OpenAI API key
- A Better Auth configuration (see backend .env)

## 1. Clone and Setup

```bash
git clone <repo-url>
cd physical-ai-textbook
```

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run start
```

The Docusaurus dev server starts at `http://localhost:3000`.

## 3. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Neon Postgres (must use asyncpg driver)
DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?ssl=require

# Qdrant Cloud
QDRANT_URL=https://xxx.us-east-1-0.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-api-key

# OpenAI
OPENAI_API_KEY=sk-...

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8000

# CORS
FRONTEND_URL=http://localhost:3000
```

### Run Migrations

```bash
alembic upgrade head
```

### Index Chapter Content (one-time)

```bash
python -m app.services.embedding_service
```

This parses all MDX chapter files, generates embeddings, and
uploads chunks to Qdrant.

### Start the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

## 4. Verify Setup

1. Open `http://localhost:3000` — textbook site loads with all
   modules and chapters in the sidebar.
2. Click "Sign Up" — create an account and fill the background
   questionnaire.
3. Navigate to any chapter — verify content renders with code
   highlighting.
4. Open the chatbot panel — ask a question about the chapter.
5. Click "Personalize" — content adapts to your profile.
6. Click "Translate to Urdu" — prose translates, code stays
   in English.

## 5. Running Tests

```bash
# Frontend
cd frontend
npm run test          # Vitest unit tests
npm run test:e2e      # Playwright E2E tests

# Backend
cd backend
pytest                # All backend tests
pytest tests/unit     # Unit tests only
pytest tests/contract # Contract tests only
```

## 6. Production Build

```bash
# Frontend static build (for GitHub Pages)
cd frontend
SITE_URL=https://your-username.github.io REACT_APP_API_URL=https://api.yourdomain.com npm run build
# Output in frontend/build/

# Backend — via uvicorn
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Backend — via Docker
cd backend
docker build -t physical-ai-textbook-api .
docker run -p 8000:8000 --env-file .env physical-ai-textbook-api
```

## 7. CI/CD

- **Frontend**: Push to `main` triggers `.github/workflows/deploy-frontend.yml` — builds and deploys to GitHub Pages.
- **Backend**: Push/PR triggers `.github/workflows/ci-backend.yml` — runs lint, tests, and Docker build on main.
- Set repository variables `SITE_URL`, `BASE_URL`, and `API_URL` in GitHub Settings > Variables for the frontend deploy workflow.
