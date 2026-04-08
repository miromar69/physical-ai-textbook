"""Embedding service: parse MDX files, chunk on headings, embed with OpenAI, upload to Qdrant."""

import re
import uuid
from pathlib import Path

from openai import OpenAI
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.config import settings
from app.db.qdrant import qdrant_client

COLLECTION_NAME = "chapter_chunks"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536
MAX_CHUNK_TOKENS = 500
DOCS_DIR = Path(__file__).resolve().parents[3] / "frontend" / "docs"

openai_client = OpenAI(api_key=settings.openai_api_key)


def parse_mdx_file(path: Path) -> list[dict]:
    """Parse an MDX file into sections split on headings, stripping code blocks."""
    text = path.read_text(encoding="utf-8")

    # Remove YAML frontmatter
    text = re.sub(r"^---.*?---\s*", "", text, flags=re.DOTALL)

    # Remove import statements
    text = re.sub(r"^import\s+.*$", "", text, flags=re.MULTILINE)

    # Remove code blocks (keep prose only for embedding)
    text = re.sub(r"```[\s\S]*?```", "", text)

    # Split on headings
    sections = []
    current_heading = "Introduction"
    current_content: list[str] = []

    for line in text.split("\n"):
        heading_match = re.match(r"^(#{1,4})\s+(.+)", line)
        if heading_match:
            if current_content:
                content = "\n".join(current_content).strip()
                if content:
                    sections.append({"heading": current_heading, "content": content})
            current_heading = heading_match.group(2).strip()
            current_content = []
        else:
            current_content.append(line)

    # Last section
    if current_content:
        content = "\n".join(current_content).strip()
        if content:
            sections.append({"heading": current_heading, "content": content})

    return sections


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return len(text) // 4


def chunk_section(heading: str, content: str) -> list[dict]:
    """Split a section into chunks of ~MAX_CHUNK_TOKENS tokens."""
    if estimate_tokens(content) <= MAX_CHUNK_TOKENS:
        return [{"heading": heading, "content": content}]

    chunks = []
    paragraphs = content.split("\n\n")
    current_chunk: list[str] = []
    current_tokens = 0

    for para in paragraphs:
        para_tokens = estimate_tokens(para)
        if current_tokens + para_tokens > MAX_CHUNK_TOKENS and current_chunk:
            chunks.append({"heading": heading, "content": "\n\n".join(current_chunk)})
            current_chunk = []
            current_tokens = 0
        current_chunk.append(para)
        current_tokens += para_tokens

    if current_chunk:
        chunks.append({"heading": heading, "content": "\n\n".join(current_chunk)})

    return chunks


def get_chapter_slug(path: Path) -> str:
    """Derive chapter slug from path: module-1/chapter-1."""
    relative = path.relative_to(DOCS_DIR)
    return str(relative.with_suffix("")).replace("\\", "/")


def get_module_number(slug: str) -> int | None:
    """Extract module number from slug."""
    match = re.match(r"module-(\d+)/", slug)
    return int(match.group(1)) if match else None


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    response = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    return [item.embedding for item in response.data]


def index_all_chapters():
    """Parse all chapter MDX files, chunk, embed, and upload to Qdrant."""
    # Ensure collection exists
    collections = [c.name for c in qdrant_client.get_collections().collections]
    if COLLECTION_NAME not in collections:
        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=EMBEDDING_DIM, distance=Distance.COSINE),
        )

    # Find all chapter MDX files in module directories
    mdx_files = sorted(DOCS_DIR.glob("module-*/chapter-*.mdx"))
    all_chunks = []

    for mdx_path in mdx_files:
        slug = get_chapter_slug(mdx_path)
        module_num = get_module_number(slug)
        sections = parse_mdx_file(mdx_path)

        chunk_index = 0
        for section in sections:
            for chunk in chunk_section(section["heading"], section["content"]):
                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "chapter_slug": slug,
                    "module_number": module_num,
                    "heading": chunk["heading"],
                    "content": chunk["content"],
                    "chunk_index": chunk_index,
                })
                chunk_index += 1

    if not all_chunks:
        print("No chunks to index.")
        return

    # Embed in batches of 100
    batch_size = 100
    points = []
    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i : i + batch_size]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(texts)

        for chunk, embedding in zip(batch, embeddings):
            points.append(
                PointStruct(
                    id=chunk["id"],
                    vector=embedding,
                    payload={
                        "chapter_slug": chunk["chapter_slug"],
                        "module_number": chunk["module_number"],
                        "heading": chunk["heading"],
                        "content": chunk["content"],
                        "chunk_index": chunk["chunk_index"],
                    },
                )
            )

    # Upload to Qdrant
    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"Indexed {len(points)} chunks from {len(mdx_files)} chapters.")


if __name__ == "__main__":
    index_all_chapters()
