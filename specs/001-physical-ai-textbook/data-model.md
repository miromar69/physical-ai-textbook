# Data Model: Physical AI & Humanoid Robotics Textbook

**Date**: 2026-04-04 | **Branch**: `001-physical-ai-textbook`

## Entity Relationship Overview

```text
User 1──1 BackgroundProfile
User 1──* Conversation
Conversation 1──* Message
Conversation *──1 Chapter (context, optional)
PersonalizationCache *──1 Chapter
TranslationCache *──1 Chapter
```

## Entities

### User

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| email | string(255) | UNIQUE, NOT NULL |
| password_hash | string(255) | NOT NULL |
| display_name | string(100) | NOT NULL |
| created_at | timestamp | NOT NULL, default NOW() |
| last_login_at | timestamp | nullable |

**Notes**: Managed by Better Auth. Password hashing handled by
the auth library (bcrypt/argon2). Email used as login identifier.

### BackgroundProfile

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → User.id, UNIQUE, NOT NULL |
| python_level | enum | beginner/intermediate/advanced, NOT NULL |
| ros_level | enum | beginner/intermediate/advanced, NOT NULL |
| ml_ai_level | enum | beginner/intermediate/advanced, NOT NULL |
| simulation_level | enum | beginner/intermediate/advanced, NOT NULL |
| has_gpu | boolean | NOT NULL, default false |
| has_robot_kit | boolean | NOT NULL, default false |
| has_sensors | boolean | NOT NULL, default false |
| created_at | timestamp | NOT NULL, default NOW() |
| updated_at | timestamp | NOT NULL, default NOW() |

**Notes**: One-to-one with User. Created during signup questionnaire.
Users can update their profile later from account settings.
The `profile_hash` is computed at read time from skill levels
for personalization cache keys.

### Conversation

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → User.id, NOT NULL |
| chapter_slug | string(100) | nullable (page context) |
| started_at | timestamp | NOT NULL, default NOW() |
| last_message_at | timestamp | nullable |

**Notes**: One conversation per page visit. `chapter_slug` matches
the Docusaurus doc slug (e.g., `module-1/chapter-1`). Conversations
are not retained across sessions per spec assumption.

### Message

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| conversation_id | UUID | FK → Conversation.id, NOT NULL |
| role | enum | user/assistant, NOT NULL |
| content | text | NOT NULL |
| selected_text | text | nullable (user's text selection context) |
| created_at | timestamp | NOT NULL, default NOW() |

**Notes**: Messages are append-only within a conversation.
`selected_text` is populated when the user triggers chat from
a text selection on the page.

### PersonalizationCache

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| chapter_slug | string(100) | NOT NULL |
| profile_hash | string(64) | NOT NULL, SHA-256 of profile fields |
| personalized_content | text | NOT NULL |
| created_at | timestamp | NOT NULL, default NOW() |
| expires_at | timestamp | NOT NULL |

**Unique constraint**: (chapter_slug, profile_hash)

**Notes**: Caches LLM-personalized chapter content to avoid
redundant API calls. Two users with identical profiles share
the same cache entry. `expires_at` enables cache invalidation
when chapter content is updated.

### TranslationCache

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| chapter_slug | string(100) | NOT NULL |
| content_hash | string(64) | NOT NULL, SHA-256 of original content |
| translated_content | text | NOT NULL |
| created_at | timestamp | NOT NULL, default NOW() |

**Unique constraint**: (chapter_slug, content_hash)

**Notes**: Caches Urdu translations. `content_hash` is computed
from the original English chapter content so translations
auto-invalidate when content changes.

## Qdrant Collections

### chapter_chunks

| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Point ID |
| vector | float[1536] | OpenAI text-embedding-3-small vector |
| payload.chapter_slug | string | Source chapter reference |
| payload.module_number | int | Module number (1-4) |
| payload.heading | string | Section heading for context |
| payload.content | string | Chunk text (~500 tokens) |
| payload.chunk_index | int | Position within chapter |

**Notes**: Indexed with HNSW. Chunks are created by splitting MDX
prose content (excluding code blocks) on heading boundaries, then
subdividing sections exceeding 500 tokens.
