"""RAG service: embed query, retrieve from Qdrant, generate response via OpenAI."""

from openai import OpenAI

from app.config import settings
from app.db.qdrant import qdrant_client
from app.services.embedding_service import COLLECTION_NAME, EMBEDDING_MODEL

openai_client = OpenAI(api_key=settings.openai_api_key)

TOP_K = 5

SYSTEM_PROMPT = """You are a helpful teaching assistant for the Physical AI & Humanoid Robotics textbook.
Your role is to answer student questions based ONLY on the textbook content provided below.

Rules:
- Answer based on the provided context chunks. If the answer is not in the context, say so clearly.
- Be concise but thorough. Use examples from the textbook when relevant.
- If the student selected specific text, focus your answer on that selection.
- Do not make up information. Do not answer questions unrelated to robotics, ROS 2, simulation, or the textbook topics.
- When referencing content, mention the chapter/section it comes from.

Context from the textbook:
{context}
"""


def embed_query(query: str) -> list[float]:
    """Embed a single query string."""
    response = openai_client.embeddings.create(model=EMBEDDING_MODEL, input=[query])
    return response.data[0].embedding


def retrieve_chunks(
    query_embedding: list[float],
    chapter_slug: str | None = None,
    top_k: int = TOP_K,
) -> list[dict]:
    """Search Qdrant for relevant chunks, optionally filtered by chapter."""
    query_filter = None
    if chapter_slug:
        from qdrant_client.models import FieldCondition, Filter, MatchValue

        query_filter = Filter(
            must=[FieldCondition(key="chapter_slug", match=MatchValue(value=chapter_slug))]
        )

    results = qdrant_client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        query_filter=query_filter,
        limit=top_k,
        with_payload=True,
    )

    return [
        {
            "chapter_slug": point.payload["chapter_slug"],
            "heading": point.payload["heading"],
            "content": point.payload["content"],
        }
        for point in results.points
    ]


def build_context(chunks: list[dict]) -> str:
    """Format retrieved chunks into context string."""
    parts = []
    for i, chunk in enumerate(chunks, 1):
        parts.append(
            f"[Source {i}: {chunk['chapter_slug']} — {chunk['heading']}]\n{chunk['content']}"
        )
    return "\n\n".join(parts)


def generate_response(
    user_message: str,
    chapter_slug: str | None = None,
    selected_text: str | None = None,
) -> dict:
    """Full RAG pipeline: embed query, retrieve, generate response."""
    # Build the query — include selected text for better retrieval
    query = user_message
    if selected_text:
        query = f"Context: {selected_text}\n\nQuestion: {user_message}"

    # Retrieve relevant chunks
    query_embedding = embed_query(query)
    chunks = retrieve_chunks(query_embedding, chapter_slug=chapter_slug)

    # Build context and system prompt
    context = build_context(chunks) if chunks else "No relevant textbook content found."
    system = SYSTEM_PROMPT.format(context=context)

    # Add selected text to user message if present
    full_message = user_message
    if selected_text:
        full_message = f'Regarding this text: "{selected_text}"\n\n{user_message}'

    # Generate response
    completion = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": full_message},
        ],
        max_tokens=1000,
        temperature=0.3,
    )

    response_text = completion.choices[0].message.content or "I couldn't generate a response."

    # Build sources
    sources = [
        {
            "chapter_slug": c["chapter_slug"],
            "heading": c["heading"],
            "snippet": c["content"][:200] + "..." if len(c["content"]) > 200 else c["content"],
        }
        for c in chunks
    ]

    return {"message": response_text, "sources": sources}
