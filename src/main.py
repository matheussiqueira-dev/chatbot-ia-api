"""Main FastAPI application."""
import os
import logging
from datetime import datetime
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import uuid

from src.database import get_db, init_db, Conversation, Message
from src.models.schemas import (
    MessageRequest,
    MessageResponse,
    ConversationHistory,
    HealthResponse,
    ErrorResponse,
)
from src.services import AIService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Chatbot IA API",
    description="API para chatbot alimentado por IA",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
try:
    ai_service = AIService()
    ai_available = True
except Exception as e:
    logger.error(f"Failed to initialize AI service: {str(e)}")
    ai_available = False
    ai_service = None

# Get the frontend directory path
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")


@app.get("/", tags=["Frontend"])
async def serve_frontend():
    """Serve the frontend application."""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "Chatbot IA API", "docs": "/docs", "health": "/health"}


@app.get("/styles.css", tags=["Frontend"])
async def serve_styles():
    """Serve the CSS file."""
    css_path = FRONTEND_DIR / "styles.css"
    if css_path.exists():
        return FileResponse(css_path, media_type="text/css")
    raise HTTPException(status_code=404, detail="CSS not found")


@app.get("/app.js", tags=["Frontend"])
async def serve_js():
    """Serve the JavaScript file."""
    js_path = FRONTEND_DIR / "app.js"
    if js_path.exists():
        return FileResponse(js_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="JS not found")


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health status."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow(),
        database_connected=True,
        ai_model_ready=ai_available,
    )


@app.post("/chat", response_model=MessageResponse, tags=["Chat"], status_code=status.HTTP_201_CREATED)
async def send_message(
    request: MessageRequest,
    db: Session = Depends(get_db),
):
    """Send a message to the chatbot.
    
    Args:
        request: Message request with content and optional conversation_id
        db: Database session
        
    Returns:
        MessageResponse with AI response and metadata
    """
    if not ai_available or ai_service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is not available",
        )

    try:
        # Get or create conversation
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            conversation = Conversation(
                id=conversation_id,
                user_id=request.user_id,
                title=request.content[:50] if request.content else "Untitled",
            )
            db.add(conversation)
            db.commit()
            logger.info(f"Created new conversation: {conversation_id}")

        # Get conversation history for context
        history_records = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()

        conversation_history = [(msg.user_message, msg.ai_response) for msg in history_records]

        # Generate AI response
        logger.info(f"Generating response for conversation: {conversation_id}")
        ai_response, tokens_used = ai_service.generate_response(request.content, conversation_history)

        # Store message in database
        message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            user_message=request.content,
            ai_response=ai_response,
            tokens_used=tokens_used,
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        logger.info(f"Message stored: {message.id}")

        return MessageResponse(
            id=message.id,
            conversation_id=message.conversation_id,
            user_message=message.user_message,
            ai_response=message.ai_response,
            timestamp=message.created_at,
            tokens_used=message.tokens_used,
        )

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred",
        )
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}",
        )


@app.get(
    "/conversation/{conversation_id}",
    response_model=ConversationHistory,
    tags=["Chat"],
)
async def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieve conversation history.
    
    Args:
        conversation_id: ID of the conversation to retrieve
        db: Database session
        
    Returns:
        ConversationHistory with all messages
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()

        message_responses = [
            MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                user_message=msg.user_message,
                ai_response=msg.ai_response,
                timestamp=msg.created_at,
                tokens_used=msg.tokens_used,
            )
            for msg in messages
        ]

        return ConversationHistory(
            conversation_id=conversation.id,
            user_id=conversation.user_id,
            messages=message_responses,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            total_messages=len(messages),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving conversation",
        )


@app.delete("/conversation/{conversation_id}", tags=["Chat"])
async def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Delete a conversation and all its messages.
    
    Args:
        conversation_id: ID of the conversation to delete
        db: Database session
        
    Returns:
        Confirmation message
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        # Delete messages first (cascade delete)
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        db.delete(conversation)
        db.commit()

        logger.info(f"Deleted conversation: {conversation_id}")

        return {
            "message": "Conversation deleted successfully",
            "conversation_id": conversation_id,
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred",
        )
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting conversation",
        )


@app.post("/conversation/{conversation_id}/reset", tags=["Chat"])
async def reset_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Reset a conversation by clearing all messages but keeping the conversation.
    
    Args:
        conversation_id: ID of the conversation to reset
        db: Database session
        
    Returns:
        Confirmation message
    """
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

        # Delete all messages in the conversation
        db.query(Message).filter(Message.conversation_id == conversation_id).delete()
        conversation.updated_at = datetime.utcnow()
        db.commit()

        logger.info(f"Reset conversation: {conversation_id}")

        return {
            "message": "Conversation reset successfully",
            "conversation_id": conversation_id,
        }

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred",
        )
    except Exception as e:
        logger.error(f"Error resetting conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting conversation",
        )


@app.get("/conversations", tags=["Chat"])
async def list_conversations(
    user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """List conversations with pagination.
    
    Args:
        user_id: Optional filter by user ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of conversations
    """
    try:
        query = db.query(Conversation)

        if user_id:
            query = query.filter(Conversation.user_id == user_id)

        conversations = query.order_by(Conversation.updated_at.desc()).offset(skip).limit(limit).all()

        return {
            "total": query.count(),
            "conversations": [
                {
                    "id": conv.id,
                    "user_id": conv.user_id,
                    "title": conv.title,
                    "created_at": conv.created_at,
                    "updated_at": conv.updated_at,
                    "message_count": len(conv.messages),
                }
                for conv in conversations
            ],
        }

    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error listing conversations",
        )


@app.get("/", tags=["Info"])
async def root():
    """API root endpoint with documentation links."""
    return {
        "name": "Chatbot IA API",
        "version": "1.0.0",
        "description": "API para chatbot alimentado por IA",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


# Error handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions."""
    logger.error(f"ValueError: {str(exc)}")
    return {
        "error": "Invalid value",
        "detail": str(exc),
        "error_code": "INVALID_VALUE",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_DEBUG", "True") == "True",
    )
