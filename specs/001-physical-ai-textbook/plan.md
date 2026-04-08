# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `001-physical-ai-textbook` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-physical-ai-textbook/spec.md`

## Summary

Build an interactive online textbook for Physical AI & Humanoid
Robotics with 4 modules (ROS 2, Gazebo/Unity, NVIDIA Isaac, VLA),
an AI-powered RAG chatbot, user authentication with background
profiling, content personalization, Urdu translation, and
GitHub Pages deployment. The frontend is a Docusaurus 3 site
with MDX content and custom React components. The backend is a
FastAPI service providing auth (Better Auth), RAG chatbot
(OpenAI Agents SDK + Qdrant), personalization, and translation
endpoints. Data is stored in Neon Serverless Postgres (users,
profiles, conversations) and Qdrant Cloud (chapter embeddings).

## Technical Context

**Language/Version**: TypeScript 5+ (frontend), Python 3.11+ (backend)
**Primary Dependencies**: Docusaurus 3.x, React 18, MDX 3, FastAPI,
  Better Auth, OpenAI Agents SDK, Qdrant client, Neon serverless driver
**Storage**: Neon Serverless Postgres (relational), Qdrant Cloud (vectors)
**Testing**: Vitest (frontend unit/component), pytest (backend),
  Playwright (E2E)
**Target Platform**: GitHub Pages (static frontend), cloud VM or
  container service (backend API)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <3s initial page load, <10s chatbot response,
  <15s translation, <5s personalization
**Constraints**: GitHub Pages static-only hosting (no SSR); backend
  MUST handle all dynamic features via API; CORS required
**Scale/Scope**: ~10-12 chapter pages, ~100 concurrent users initially,
  single backend instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Content Accuracy | Chapters include learning objectives, prerequisites, measurable outcomes | ✅ Planned in MDX frontmatter |
| II. Interactive-First | Each concept has interactive element; graceful degradation | ✅ Code examples + chatbot; static fallbacks for simulations |
| III. Modular Architecture | Layers independently deployable; typed API contracts | ✅ Docusaurus (GH Pages) + FastAPI (separate deploy); OpenAPI contracts |
| IV. Test-First | TDD for app code; MDX linting | ✅ Vitest + pytest + Playwright; MDX link-checking in CI |
| V. Security & Privacy | No hardcoded secrets; encrypted data; session security | ✅ .env for secrets; Better Auth sessions; HTTPS enforced |
| VI. Accessibility | WCAG 2.1 AA; keyboard nav; alt text; RTL support | ✅ Docusaurus a11y defaults; RTL for Urdu; alt text in MDX |

**Gate result**: PASS — all principles satisfied by design.

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-textbook/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── docusaurus.config.ts     # Docusaurus configuration
├── sidebars.ts              # Sidebar navigation config
├── package.json
├── tsconfig.json
├── src/
│   ├── components/
│   │   ├── ChatPanel/       # RAG chatbot UI component
│   │   ├── PersonalizeButton/ # Content personalization trigger
│   │   ├── TranslateButton/ # Urdu translation trigger
│   │   ├── TextSelector/    # Text selection for chatbot context
│   │   └── AuthButtons/     # Sign in/up header buttons
│   ├── pages/
│   │   ├── index.tsx        # Homepage / Introduction
│   │   ├── signin.tsx       # Sign in page
│   │   └── signup.tsx       # Sign up + background questionnaire
│   ├── theme/
│   │   └── DocItem/         # Custom doc layout (inject chat, personalize, translate)
│   ├── contexts/
│   │   └── AuthContext.tsx   # Auth state provider
│   └── services/
│       └── api.ts           # Backend API client
├── docs/
│   ├── intro.mdx            # Course introduction
│   ├── course-overview.mdx  # Course overview
│   ├── hardware-requirements.mdx
│   ├── module-1/
│   │   ├── _category_.json
│   │   ├── chapter-1.mdx    # ROS 2 Foundations
│   │   └── chapter-2.mdx    # ROS 2 Advanced Topics
│   ├── module-2/
│   │   ├── _category_.json
│   │   ├── chapter-1.mdx    # Gazebo Simulation
│   │   ├── chapter-2.mdx    # Unity Digital Twin
│   │   └── chapter-3.mdx    # Sim-to-Real Transfer
│   ├── module-3/
│   │   ├── _category_.json
│   │   ├── chapter-1.mdx    # Isaac Sim Fundamentals
│   │   └── chapter-2.mdx    # Isaac for Manipulation
│   └── module-4/
│       ├── _category_.json
│       ├── chapter-1.mdx    # VLA Architecture
│       └── chapter-2.mdx    # VLA Training & Deployment
├── static/
│   └── img/                 # Diagrams, figures
└── tests/
    ├── components/          # Vitest component tests
    └── e2e/                 # Playwright E2E tests

backend/
├── pyproject.toml
├── requirements.txt
├── .env.example
├── alembic.ini
├── alembic/
│   └── versions/            # DB migrations
├── app/
│   ├── main.py              # FastAPI app entry, CORS, lifespan
│   ├── config.py            # Settings from env vars
│   ├── models/
│   │   ├── user.py          # User + BackgroundProfile SQLAlchemy models
│   │   └── chat.py          # Conversation + Message models
│   ├── schemas/
│   │   ├── auth.py          # Pydantic schemas for auth endpoints
│   │   ├── chat.py          # Pydantic schemas for chat endpoints
│   │   ├── profile.py       # Background profile schemas
│   │   ├── personalize.py   # Personalization request/response
│   │   └── translate.py     # Translation request/response
│   ├── api/
│   │   ├── auth.py          # /auth/* routes (Better Auth)
│   │   ├── chat.py          # /chat/* routes (RAG chatbot)
│   │   ├── personalize.py   # /personalize/* routes
│   │   └── translate.py     # /translate/* routes
│   ├── services/
│   │   ├── auth_service.py  # Better Auth integration
│   │   ├── rag_service.py   # OpenAI Agents SDK + Qdrant retrieval
│   │   ├── embedding_service.py  # Chapter embedding + indexing
│   │   ├── personalize_service.py # LLM-based content adaptation
│   │   └── translate_service.py   # LLM-based Urdu translation
│   └── db/
│       ├── database.py      # Neon Postgres connection
│       └── qdrant.py        # Qdrant Cloud client
└── tests/
    ├── conftest.py
    ├── unit/
    ├── integration/
    └── contract/
```

**Structure Decision**: Web application structure with `frontend/`
(Docusaurus) and `backend/` (FastAPI) at repository root. This
aligns with Constitution Principle III (Modular Architecture) —
each layer is independently deployable and testable. The frontend
builds to static assets for GitHub Pages. The backend runs as a
standalone Python service.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
