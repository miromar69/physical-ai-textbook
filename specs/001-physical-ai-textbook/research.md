# Research: Physical AI & Humanoid Robotics Textbook

**Date**: 2026-04-04 | **Branch**: `001-physical-ai-textbook`

## R1: Docusaurus Custom Components in MDX Pages

**Decision**: Use Docusaurus "swizzling" to wrap the DocItem layout,
injecting ChatPanel, PersonalizeButton, and TranslateButton into
every doc page without modifying each MDX file individually.

**Rationale**: Swizzling the DocItem/Layout component provides a
single injection point. Each custom component is rendered
conditionally based on auth state. This avoids duplicating
component imports across 10+ MDX files and keeps content
files focused on content.

**Alternatives considered**:
- MDX Remark plugin to auto-inject components: fragile, hard
  to debug, breaks on Docusaurus updates.
- Manual imports in every MDX file: works but violates DRY,
  error-prone as chapter count grows.

## R2: Better Auth Integration with Docusaurus (SPA)

**Decision**: Use Better Auth client SDK on the frontend with
session tokens stored in httpOnly cookies. The backend FastAPI
app acts as the Better Auth server, exposing `/auth/*` endpoints.
The Docusaurus frontend calls these endpoints via the API client.

**Rationale**: Better Auth provides email/password auth out of the
box with secure session management. Using httpOnly cookies (not
localStorage) aligns with Constitution Principle V (Security).
The backend owns all auth state — the frontend is stateless.

**Alternatives considered**:
- NextAuth/Auth.js: requires Next.js, incompatible with Docusaurus.
- Supabase Auth: adds another managed service; Neon already
  provides Postgres.
- Custom JWT auth: more implementation work, higher security risk.

## R3: RAG Pipeline Architecture

**Decision**: Use a two-phase pipeline:
1. **Indexing** (offline): Parse MDX chapter files → split into
   chunks (~500 tokens) → generate embeddings via OpenAI → store
   in Qdrant Cloud with chapter/module metadata.
2. **Query** (runtime): User question → embed query → Qdrant
   similarity search (top-5 chunks) → construct prompt with
   retrieved context → OpenAI Agents SDK generates response.

**Rationale**: OpenAI Agents SDK provides structured tool-use
and conversation management. Qdrant Cloud is a managed vector
store requiring no self-hosting. The chunking strategy preserves
section context via metadata (chapter, module, heading).

**Alternatives considered**:
- LangChain: heavier dependency, more abstraction than needed.
- Pinecone: similar to Qdrant but Qdrant was specified in reqs.
- Full-text search only (Postgres): misses semantic similarity.

## R4: Content Personalization Strategy

**Decision**: Use LLM-based runtime adaptation. When a user clicks
"Personalize", send the original chapter content (or the current
section) plus the user's background profile to the backend. The
backend calls OpenAI to rewrite the content at the appropriate
difficulty level. Cache the personalized result per
(chapter, profile-hash) pair in Postgres to avoid redundant
LLM calls.

**Rationale**: Pre-authoring 3 difficulty variants per chapter
(beginner/intermediate/advanced) would triple content
maintenance. LLM adaptation is dynamic, handles nuanced profiles
(e.g., "advanced Python but beginner ROS"), and requires zero
extra authoring effort.

**Alternatives considered**:
- Pre-authored variants: accurate but unsustainable maintenance.
- Client-side LLM (WebLLM): too slow, large model downloads.
- Simple show/hide sections by difficulty tag: too coarse,
  doesn't adapt examples or explanations.

## R5: Urdu Translation Strategy

**Decision**: Use LLM-based runtime translation via the backend.
When "Translate to Urdu" is clicked, send chapter prose content
(excluding code blocks) to the backend. The backend calls OpenAI
with a system prompt enforcing: translate to Urdu, preserve
technical terms and code in English, output clean Markdown.
Cache translations per (chapter, content-hash) in Postgres.

**Rationale**: Professional human translation of 10+ chapters is
costly and creates maintenance burden when content changes. LLM
translation provides good quality for technical Urdu and can be
regenerated when content updates. Caching avoids repeated API
costs.

**Alternatives considered**:
- Google Translate API: cheaper per-call but lower quality for
  technical content and no control over term preservation.
- Pre-translated static files: high upfront cost, stale on
  content changes.
- Client-side translation: would expose API keys, slow on device.

## R6: GitHub Pages Deployment with API Backend

**Decision**: Deploy Docusaurus static build to GitHub Pages via
GitHub Actions. Deploy FastAPI backend to a cloud container
service (Railway, Render, or Fly.io — user's choice). Frontend
calls backend via environment-configured API base URL. CORS
is configured on the backend to allow the GitHub Pages origin.

**Rationale**: GitHub Pages is free and integrates with the repo.
The backend needs a persistent process (WebSocket-optional,
REST minimum) which GitHub Pages cannot serve. Separating
deploys aligns with Constitution Principle III.

**Alternatives considered**:
- Vercel for frontend: works but adds a service when GH Pages
  suffices for static sites.
- Single deploy (backend serves frontend): couples deploys,
  loses GH Pages simplicity.

## R7: Text Selection for Chatbot Context

**Decision**: Implement a custom React hook (`useTextSelection`)
that listens for `mouseup`/`selectionchange` events on the doc
content area. When text is selected, show a floating "Ask about
this" button near the selection. Clicking it opens the chat
panel with the selected text pre-populated as context.

**Rationale**: Native browser Selection API is well-supported
and requires no external library. A floating button is
discoverable without cluttering the UI.

**Alternatives considered**:
- Right-click context menu: requires overriding browser default,
  poor mobile support.
- Highlight + sidebar integration: more complex UX, not needed
  for MVP.

## R8: Background Questionnaire Design

**Decision**: Present a multi-step form during signup (after
email/password) with two sections:
1. **Software Skills**: Python, ROS, ML/AI, Simulation Tools —
   each rated Beginner / Intermediate / Advanced via radio buttons.
2. **Hardware Access**: GPU, Robot Kit, Sensors — each Yes / No
   toggle.

Store as a JSON profile object in Postgres linked to the user.

**Rationale**: Structured ratings enable deterministic
personalization prompts. Radio buttons are fast to complete
(< 1 minute). JSON storage is flexible for adding future
skill categories.

**Alternatives considered**:
- Free-text self-description: harder to parse programmatically.
- Adaptive quiz to assess level: slower, higher friction at
  signup, overkill for self-reported profiling.
