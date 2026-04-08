from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.chat import Conversation, Message, MessageRole
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse, ChatSource
from app.services.auth_service import get_current_user
from app.services.rag_service import generate_response

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    data: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get or create conversation
    if data.conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == data.conversation_id,
                Conversation.user_id == user.id,
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
            )
    else:
        conversation = Conversation(
            user_id=user.id,
            chapter_slug=data.chapter_slug,
        )
        db.add(conversation)
        await db.flush()

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=data.message,
        selected_text=data.selected_text,
    )
    db.add(user_msg)

    # Generate RAG response
    rag_result = generate_response(
        user_message=data.message,
        chapter_slug=data.chapter_slug or conversation.chapter_slug,
        selected_text=data.selected_text,
    )

    # Save assistant message
    assistant_msg = Message(
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=rag_result["message"],
    )
    db.add(assistant_msg)

    # Update conversation timestamp
    conversation.last_message_at = datetime.now(timezone.utc)
    await db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        message=rag_result["message"],
        sources=[ChatSource(**s) for s in rag_result["sources"]],
    )
