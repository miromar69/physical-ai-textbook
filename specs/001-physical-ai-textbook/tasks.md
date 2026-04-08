# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-physical-ai-textbook/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Constitution Principle IV (Test-First) mandates TDD for all application code. Test tasks are included for backend services and frontend components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/` (Docusaurus), `backend/` (FastAPI)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for both frontend and backend

- [x] T001 Initialize Docusaurus 3 project with TypeScript in `frontend/` including `package.json`, `docusaurus.config.ts`, `tsconfig.json`, and `sidebars.ts`
- [x] T002 Initialize Python backend project in `backend/` with `pyproject.toml`, `requirements.txt`, and `app/__init__.py`
- [x] T003 [P] Create `.env.example` in `backend/` with all required env vars (DATABASE_URL, QDRANT_URL, QDRANT_API_KEY, OPENAI_API_KEY, BETTER_AUTH_SECRET, BETTER_AUTH_URL, FRONTEND_URL)
- [x] T004 [P] Configure ESLint + Prettier for frontend in `frontend/.eslintrc.js` and `frontend/.prettierrc`
- [x] T005 [P] Configure Ruff for backend linting in `backend/pyproject.toml` (ruff section)
- [x] T006 [P] Configure Vitest for frontend testing in `frontend/vitest.config.ts`
- [x] T007 [P] Configure pytest for backend testing in `backend/pyproject.toml` (pytest section) and `backend/tests/conftest.py`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create backend settings module loading env vars via Pydantic BaseSettings in `backend/app/config.py`
- [x] T009 Set up Neon Postgres connection with async SQLAlchemy engine in `backend/app/db/database.py`
- [x] T010 [P] Set up Qdrant Cloud client connection in `backend/app/db/qdrant.py`
- [x] T011 Set up Alembic migrations framework with `backend/alembic.ini` and `backend/alembic/env.py`
- [x] T012 Create FastAPI app entry point with CORS middleware, lifespan events (DB connect/disconnect), and health endpoint in `backend/app/main.py`
- [x] T013 Create frontend API client service with base URL config, fetch wrapper, and error handling in `frontend/src/services/api.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Browse and Read Textbook Content (Priority: P1) MVP

**Goal**: Deliver a fully navigable Docusaurus textbook site with all 4 modules, chapters, sidebar navigation, and rich content

**Independent Test**: Navigate to `http://localhost:3000`, verify all modules/chapters render in sidebar, click through each chapter, confirm code highlighting, images, and next/prev links work

### Tests for User Story 1

- [ ] T014 [P] [US1] Write Vitest test for homepage rendering (title, module listing, navigation links) in `frontend/tests/components/Homepage.test.tsx`
- [ ] T015 [P] [US1] Write Playwright E2E test for sidebar navigation across all modules and chapters in `frontend/tests/e2e/navigation.spec.ts`

### Implementation for User Story 1

- [x] T016 [US1] Create homepage component with course introduction, module cards, and "Get Started" CTA in `frontend/src/pages/index.tsx`
- [x] T017 [P] [US1] Create course overview MDX page with learning objectives, module summaries, and prerequisites in `frontend/docs/course-overview.mdx`
- [x] T018 [P] [US1] Create hardware requirements MDX page with required/recommended hardware table in `frontend/docs/hardware-requirements.mdx`
- [x] T019 [P] [US1] Create introduction MDX page with welcome message and how-to-use-this-book guide in `frontend/docs/intro.mdx`
- [x] T020 [US1] Create Module 1 category config and chapter MDX files: `frontend/docs/module-1/_category_.json`, `frontend/docs/module-1/chapter-1.mdx` (ROS 2 Foundations), `frontend/docs/module-1/chapter-2.mdx` (ROS 2 Advanced Topics)
- [x] T021 [P] [US1] Create Module 2 category config and chapter MDX files: `frontend/docs/module-2/_category_.json`, `frontend/docs/module-2/chapter-1.mdx` (Gazebo Simulation), `frontend/docs/module-2/chapter-2.mdx` (Unity Digital Twin), `frontend/docs/module-2/chapter-3.mdx` (Sim-to-Real Transfer)
- [x] T022 [P] [US1] Create Module 3 category config and chapter MDX files: `frontend/docs/module-3/_category_.json`, `frontend/docs/module-3/chapter-1.mdx` (Isaac Sim Fundamentals), `frontend/docs/module-3/chapter-2.mdx` (Isaac for Manipulation)
- [x] T023 [P] [US1] Create Module 4 category config and chapter MDX files: `frontend/docs/module-4/_category_.json`, `frontend/docs/module-4/chapter-1.mdx` (VLA Architecture), `frontend/docs/module-4/chapter-2.mdx` (VLA Training & Deployment)
- [x] T024 [US1] Configure sidebar navigation in `frontend/sidebars.ts` with module groupings, chapter ordering, intro pages, and breadcrumb support
- [x] T025 [US1] Update `frontend/docusaurus.config.ts` with site metadata (title, tagline, favicon), navbar links (Course Overview, Hardware Requirements), and footer

**Checkpoint**: User Story 1 complete — full textbook navigable at localhost:3000

---

## Phase 4: User Story 2 — Sign Up and Provide Background Profile (Priority: P2)

**Goal**: Users can create accounts with email/password, complete a background questionnaire, sign in, and see their identity in the header

**Independent Test**: Click Sign Up, fill email/password, complete the background questionnaire (software skills + hardware), submit. Sign out. Sign in again. Verify display name appears in header

### Tests for User Story 2

- [ ] T026 [P] [US2] Write pytest unit tests for User and BackgroundProfile models in `backend/tests/unit/test_user_model.py`
- [ ] T027 [P] [US2] Write pytest contract tests for POST /auth/signup, POST /auth/signin, POST /auth/signout, GET /auth/me in `backend/tests/contract/test_auth_api.py`
- [ ] T028 [P] [US2] Write pytest contract tests for GET /profile and PUT /profile in `backend/tests/contract/test_profile_api.py`
- [ ] T029 [P] [US2] Write Vitest test for signup form and background questionnaire component in `frontend/tests/components/SignupForm.test.tsx`

### Implementation for User Story 2

- [x] T030 [US2] Create User SQLAlchemy model in `backend/app/models/user.py` with id, email, password_hash, display_name, created_at, last_login_at fields per data-model.md
- [x] T031 [US2] Create BackgroundProfile SQLAlchemy model in `backend/app/models/user.py` with skill levels (python, ros, ml_ai, simulation as enum), hardware booleans, and FK to User
- [ ] T032 [US2] Generate Alembic migration for User and BackgroundProfile tables via `alembic revision --autogenerate`
- [x] T033 [P] [US2] Create Pydantic schemas for auth endpoints (SignupRequest, SigninRequest, AuthResponse, UserResponse) in `backend/app/schemas/auth.py`
- [x] T034 [P] [US2] Create Pydantic schemas for profile endpoints (BackgroundProfile, BackgroundProfileUpdate) in `backend/app/schemas/profile.py`
- [x] T035 [US2] Implement auth service with Better Auth integration (signup with profile creation, signin, signout, get current user) in `backend/app/services/auth_service.py`
- [x] T036 [US2] Implement auth API routes (POST /auth/signup, POST /auth/signin, POST /auth/signout, GET /auth/me) in `backend/app/api/auth.py` and register router in `backend/app/main.py`
- [x] T037 [US2] Implement profile API routes (GET /profile, PUT /profile) in `backend/app/api/profile.py` and register router in `backend/app/main.py`
- [x] T038 [US2] Create AuthContext provider with session state, login/logout methods, and user info in `frontend/src/contexts/AuthContext.tsx`
- [x] T039 [US2] Create signup page with email/password form and multi-step background questionnaire (software skills radio buttons, hardware toggles) in `frontend/src/pages/signup.tsx`
- [x] T040 [US2] Create signin page with email/password form and error handling in `frontend/src/pages/signin.tsx`
- [x] T041 [US2] Create AuthButtons navbar component (Sign In / Sign Up when anonymous, display name + Sign Out when authenticated) in `frontend/src/components/AuthButtons/index.tsx`
- [x] T042 [US2] Integrate AuthButtons into Docusaurus navbar via `frontend/docusaurus.config.ts` custom navbar item

**Checkpoint**: User Story 2 complete — full auth flow with background profile working

---

## Phase 5: User Story 3 — Ask the RAG Chatbot a Question (Priority: P3)

**Goal**: Authenticated users can open a chatbot panel on any chapter page, ask questions, get contextual answers from textbook content, and use text selection for targeted questions

**Independent Test**: Sign in, navigate to any chapter, open chatbot, type a question about the chapter topic, verify response references textbook content. Select text on the page, click "Ask about this", verify chatbot receives the selection as context

### Tests for User Story 3

- [ ] T043 [P] [US3] Write pytest unit tests for embedding service (chunk splitting, metadata extraction) in `backend/tests/unit/test_embedding_service.py`
- [ ] T044 [P] [US3] Write pytest unit tests for RAG service (query embedding, context retrieval, prompt construction) in `backend/tests/unit/test_rag_service.py`
- [ ] T045 [P] [US3] Write pytest contract tests for POST /chat/message (with and without selected_text, out-of-scope query handling) in `backend/tests/contract/test_chat_api.py`
- [ ] T046 [P] [US3] Write Vitest test for ChatPanel component (open/close, send message, display response, loading state) in `frontend/tests/components/ChatPanel.test.tsx`

### Implementation for User Story 3

- [x] T047 [US3] Create Conversation and Message SQLAlchemy models in `backend/app/models/chat.py` with fields per data-model.md
- [ ] T048 [US3] Generate Alembic migration for Conversation and Message tables
- [x] T049 [P] [US3] Create Pydantic schemas for chat endpoints (ChatRequest, ChatResponse with sources) in `backend/app/schemas/chat.py`
- [x] T050 [US3] Implement embedding service: parse MDX files, split into ~500-token chunks on heading boundaries, generate OpenAI embeddings, upload to Qdrant with chapter/module metadata in `backend/app/services/embedding_service.py`
- [x] T051 [US3] Implement RAG service: embed user query, Qdrant similarity search (top-5), construct system prompt with retrieved chunks, call OpenAI Agents SDK, scope responses to textbook content in `backend/app/services/rag_service.py`
- [x] T052 [US3] Implement chat API route (POST /chat/message) with conversation management, auth check, and rate limiting in `backend/app/api/chat.py` and register router in `backend/app/main.py`
- [x] T053 [US3] Create ChatPanel React component with slide-out panel, message input, message list, loading indicator, source citations, and "service unavailable" fallback in `frontend/src/components/ChatPanel/index.tsx`
- [x] T054 [US3] Create useTextSelection hook listening for mouseup/selectionchange on doc content, showing floating "Ask about this" button in `frontend/src/components/TextSelector/index.tsx`
- [x] T055 [US3] Swizzle Docusaurus DocItem/Layout to inject ChatPanel and TextSelector into every doc page in `frontend/src/theme/DocItem/Layout.tsx`
- [ ] T056 [US3] Run embedding service to index all chapter MDX files into Qdrant (one-time CLI command: `python -m app.services.embedding_service`)

**Checkpoint**: User Story 3 complete — chatbot answers questions with textbook context, text selection works

---

## Phase 6: User Story 4 — Personalize Chapter Content (Priority: P4)

**Goal**: Authenticated users click "Personalize" on any chapter to get content adapted to their background profile, with caching to reduce LLM costs

**Independent Test**: Create two users with different profiles (beginner vs advanced). Navigate to the same chapter. Click "Personalize" on each. Verify content differs (more comments/explanations for beginner, concise for advanced)

### Tests for User Story 4

- [ ] T057 [P] [US4] Write pytest unit tests for personalize service (profile hash computation, prompt construction, cache lookup/store) in `backend/tests/unit/test_personalize_service.py`
- [ ] T058 [P] [US4] Write pytest contract tests for POST /personalize (authenticated, unauthenticated, cached vs fresh) in `backend/tests/contract/test_personalize_api.py`
- [ ] T059 [P] [US4] Write Vitest test for PersonalizeButton component (auth-gated, loading state, content swap) in `frontend/tests/components/PersonalizeButton.test.tsx`

### Implementation for User Story 4

- [x] T060 [US4] Create PersonalizationCache SQLAlchemy model in `backend/app/models/cache.py` with chapter_slug, profile_hash, personalized_content, expires_at per data-model.md
- [ ] T061 [US4] Generate Alembic migration for PersonalizationCache table
- [x] T062 [P] [US4] Create Pydantic schemas for personalize endpoint (PersonalizeRequest, PersonalizeResponse) in `backend/app/schemas/personalize.py`
- [x] T063 [US4] Implement personalize service: compute profile hash, check cache, construct LLM prompt with chapter content + user profile, call OpenAI, store result in cache in `backend/app/services/personalize_service.py`
- [x] T064 [US4] Implement personalize API route (POST /personalize) with auth check in `backend/app/api/personalize.py` and register router in `backend/app/main.py`
- [x] T065 [US4] Create PersonalizeButton React component: shows "Personalize" for authenticated users, "Sign in to personalize" for anonymous, sends chapter content to backend, replaces doc content with personalized response in `frontend/src/components/PersonalizeButton/index.tsx`
- [x] T066 [US4] Inject PersonalizeButton into swizzled DocItem/Layout in `frontend/src/theme/DocItem/Layout.tsx`

**Checkpoint**: User Story 4 complete — personalization adapts content per user profile with caching

---

## Phase 7: User Story 5 — Translate Chapter to Urdu (Priority: P5)

**Goal**: Users click "Translate to Urdu" on any chapter to see prose translated with RTL layout while code blocks remain in English. "Show Original" reverts to English

**Independent Test**: Navigate to any chapter, click "Translate to Urdu", verify prose is in Urdu with RTL layout, code blocks remain English/LTR. Click "Show Original", verify English restored

### Tests for User Story 5

- [ ] T067 [P] [US5] Write pytest unit tests for translate service (content splitting for code preservation, cache logic, prompt construction) in `backend/tests/unit/test_translate_service.py`
- [ ] T068 [P] [US5] Write pytest contract tests for POST /translate (with code blocks, cache hit/miss) in `backend/tests/contract/test_translate_api.py`
- [ ] T069 [P] [US5] Write Vitest test for TranslateButton component (toggle state, RTL class application, code block preservation) in `frontend/tests/components/TranslateButton.test.tsx`

### Implementation for User Story 5

- [x] T070 [US5] Create TranslationCache SQLAlchemy model in `backend/app/models/cache.py` with chapter_slug, content_hash, translated_content per data-model.md
- [ ] T071 [US5] Generate Alembic migration for TranslationCache table
- [x] T072 [P] [US5] Create Pydantic schemas for translate endpoint (TranslateRequest, TranslateResponse) in `backend/app/schemas/translate.py`
- [x] T073 [US5] Implement translate service: split content into prose/code segments, compute content hash, check cache, translate prose via OpenAI (system prompt: translate to Urdu, preserve technical terms and code in English), reassemble, store in cache in `backend/app/services/translate_service.py`
- [x] T074 [US5] Implement translate API route (POST /translate) in `backend/app/api/translate.py` and register router in `backend/app/main.py`
- [x] T075 [US5] Create TranslateButton React component: "Translate to Urdu" / "Show Original" toggle, sends chapter prose to backend, applies RTL CSS class (`dir="rtl"`) to translated content while keeping code blocks LTR in `frontend/src/components/TranslateButton/index.tsx`
- [x] T076 [US5] Add RTL CSS styles for Urdu content (`.urdu-content` class with `direction: rtl`, `text-align: right`, code block override `direction: ltr`) in `frontend/src/css/custom.css`
- [x] T077 [US5] Inject TranslateButton into swizzled DocItem/Layout in `frontend/src/theme/DocItem/Layout.tsx`

**Checkpoint**: User Story 5 complete — Urdu translation with RTL layout and English code blocks

---

## Phase 8: User Story 6 — Deploy and Access the Live Site (Priority: P6)

**Goal**: Textbook deployed to GitHub Pages, backend deployed separately, all features working in production

**Independent Test**: Access the public URL, browse chapters, sign up, ask a chatbot question, personalize, and translate — all succeed end-to-end

### Tests for User Story 6

- [ ] T078 [P] [US6] Write Playwright E2E test for full production flow (load site, navigate, sign up, chatbot, personalize, translate) in `frontend/tests/e2e/production-smoke.spec.ts`

### Implementation for User Story 6

- [x] T079 [US6] Create GitHub Actions workflow for frontend: install, lint, test, build Docusaurus, deploy to GitHub Pages in `.github/workflows/deploy-frontend.yml`
- [x] T080 [P] [US6] Create GitHub Actions workflow for backend: install, lint, test, build Docker image in `.github/workflows/ci-backend.yml`
- [x] T081 [US6] Create `backend/Dockerfile` with Python 3.11 slim base, install deps, run uvicorn
- [x] T082 [US6] Update `frontend/docusaurus.config.ts` with production `url` and `baseUrl` for GitHub Pages, and production API base URL via env var
- [x] T083 [US6] Configure CORS in `backend/app/main.py` to allow GitHub Pages origin in production (read from FRONTEND_URL env var)
- [x] T084 [US6] Add `backend/.env.production.example` documenting all required production env vars with instructions

**Checkpoint**: User Story 6 complete — site live on GitHub Pages with backend API operational

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements that affect multiple user stories

- [x] T085 [P] Add MDX link-checking and linting to frontend CI in `.github/workflows/deploy-frontend.yml`
- [x] T086 [P] Add WCAG 2.1 AA accessibility audit (aria labels, alt text, keyboard navigation, color contrast) across all custom components
- [x] T087 [P] Add `frontend/static/img/` placeholder diagrams for all chapters
- [ ] T088 Run full Playwright E2E test suite against local stack to validate all user stories work together
- [x] T089 Update `specs/001-physical-ai-textbook/quickstart.md` with any changes discovered during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1): No dependencies on other stories
  - US2 (P2): No dependencies on other stories (can parallel with US1)
  - US3 (P3): Depends on US1 (needs chapter content for embeddings) and US2 (auth required)
  - US4 (P4): Depends on US2 (needs user profiles) and US1 (needs chapter content)
  - US5 (P5): Depends on US1 (needs chapter content); NO auth dependency
  - US6 (P6): Depends on all prior stories being functional
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution Principle IV)
- Models before services
- Services before API routes
- Backend before frontend (frontend calls backend APIs)
- Core implementation before integration/injection

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T007)
- Foundational T009 and T010 can run in parallel
- US1 chapter content tasks T017-T023 can run in parallel after T016
- US2 schema tasks T033-T034 can run in parallel
- US3 test tasks T043-T046 can run in parallel
- US4 test tasks T057-T059 can run in parallel
- US5 test tasks T067-T069 can run in parallel
- US1 and US2 can be worked on in parallel (after Phase 2)
- Polish tasks T085-T087 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Browse Content)
4. **STOP and VALIDATE**: All 4 modules navigable, chapters render, sidebar works
5. Deploy static site to GitHub Pages (early deploy)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Browse Content) → Test independently → MVP textbook live
3. US2 (Auth & Profile) → Test independently → Users can sign up
4. US3 (RAG Chatbot) → Test independently → Interactive Q&A working
5. US4 (Personalization) → Test independently → Adaptive content
6. US5 (Urdu Translation) → Test independently → Urdu support
7. US6 (Deployment) → Full production deploy
8. Polish → Accessibility, linting, diagrams

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (content) + User Story 5 (translation, content-dependent only)
   - Developer B: User Story 2 (auth) + User Story 4 (personalization, auth-dependent)
   - Developer C: User Story 3 (chatbot, needs US1 + US2 done first)
3. Developer D: User Story 6 (deployment, after all stories)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor per Constitution IV)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
