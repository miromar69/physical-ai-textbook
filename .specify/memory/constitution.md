<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR: initial ratification)
  Modified principles: N/A (initial creation)
  Added sections:
    - Core Principles (6): Content Accuracy, Interactive-First,
      Modular Architecture, Test-First Development,
      Security & Privacy, Accessibility & Inclusivity
    - Technology Standards
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ compatible (Constitution Check placeholder)
    - .specify/templates/spec-template.md ✅ compatible (no constitution refs)
    - .specify/templates/tasks-template.md ✅ compatible (no constitution refs)
  Follow-up TODOs: None
-->

# Physical AI & Humanoid Robotics Textbook Constitution

## Core Principles

### I. Content Accuracy & Pedagogical Rigor

All textbook content MUST be technically accurate, peer-reviewable,
and cited where applicable. Every chapter MUST include learning
objectives, prerequisite knowledge, and measurable outcomes.
Content MUST be structured for progressive difficulty across
mixed audiences (university students, industry professionals,
and self-learners). No claims without supporting references
or derivations.

### II. Interactive-First Learning

Every concept MUST be accompanied by at least one interactive
element: simulation, runnable code example, embedded visualization,
or assessment. Static explanations alone are insufficient.
Interactive simulations MUST degrade gracefully when WebGL or
JavaScript is unavailable, providing fallback static diagrams.
Code examples MUST be copy-pasteable and runnable with documented
dependencies.

### III. Modular Architecture

The system is composed of clearly separated concerns:
- **Content layer**: Docusaurus + MDX (React/TypeScript) for
  rendering and authoring all textbook content.
- **Backend layer**: FastAPI (Python) for the RAG chatbot,
  search, and API services.
- **Data layer**: Neon Serverless Postgres for relational data,
  Qdrant Cloud for vector search and embeddings.
- **Auth layer**: Better Auth for authentication and access control.
- **AI layer**: OpenAI Agents SDK for conversational tutoring.

Each layer MUST be independently deployable and testable.
Cross-layer contracts MUST be defined via typed API schemas.
No layer may directly access another layer's database or
internal state.

### IV. Test-First Development

All application code (backend services, frontend components,
API endpoints) MUST follow TDD: write failing tests first,
then implement. Content (MDX) is exempt from TDD but MUST
pass linting and link-checking. Integration tests MUST cover:
API contract boundaries, authentication flows, vector search
accuracy, and chatbot response quality. Red-Green-Refactor
cycle is enforced for all non-content code.

### V. Security & Privacy

Secrets and tokens MUST never be hardcoded; use environment
variables and `.env` files (excluded from version control).
All user data MUST be encrypted at rest and in transit.
Better Auth MUST enforce secure session management.
RAG chatbot MUST NOT leak private user data in responses.
OWASP Top 10 vulnerabilities MUST be addressed in every
code review. Dependency audits MUST run in CI.

### VI. Accessibility & Inclusivity

All content MUST meet WCAG 2.1 AA standards. Interactive
simulations MUST provide keyboard navigation and screen
reader descriptions. Content MUST support multiple reading
levels through progressive disclosure (introductory summaries
before deep dives). All images and diagrams MUST include
alt text. Color MUST NOT be the sole means of conveying
information in visualizations.

## Technology Standards

- **Frontend**: Docusaurus 3.x, React 18+, TypeScript 5+, MDX 3
- **Backend**: Python 3.11+, FastAPI, Pydantic for validation
- **Database**: Neon Serverless Postgres (relational),
  Qdrant Cloud (vector search)
- **Auth**: Better Auth
- **AI/ML**: OpenAI Agents SDK for RAG chatbot
- **Testing**: Vitest (frontend), pytest (backend),
  Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Linting**: ESLint + Prettier (frontend),
  Ruff (backend Python)

## Development Workflow

1. **Specify**: Define feature requirements in `specs/<feature>/spec.md`
   with acceptance criteria and user stories.
2. **Plan**: Produce architecture and implementation plan in
   `specs/<feature>/plan.md` with constitution compliance check.
3. **Task**: Break plan into dependency-ordered tasks in
   `specs/<feature>/tasks.md`.
4. **Implement**: Follow task order. Write tests first for
   application code. Commit after each logical task.
5. **Review**: All PRs MUST pass CI (lint, test, build).
   Content PRs MUST be reviewed for technical accuracy.
6. **Record**: Create PHR for every significant interaction.
   Surface ADR suggestions for architectural decisions.

## Governance

This constitution is the authoritative source of project
principles and standards. All code, content, and architectural
decisions MUST comply with these principles.

- **Amendments**: Any change to this constitution MUST be
  documented with rationale, approved by the project lead,
  and accompanied by a migration plan for affected artifacts.
- **Versioning**: Constitution follows semantic versioning
  (MAJOR.MINOR.PATCH). MAJOR for principle removals/redefinitions,
  MINOR for new principles or material expansions,
  PATCH for clarifications and typo fixes.
- **Compliance**: Every PR and code review MUST verify
  alignment with these principles. Violations MUST be
  resolved before merge.
- **Complexity Justification**: Any deviation from the
  simplicity principle (e.g., adding new services, layers,
  or dependencies) MUST be justified in writing.

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
