"""
Chatbot IA API - Modern FastAPI Backend
High-performance, scalable and feature-rich chatbot API.
"""
import os
import uuid
import logging
from datetime import datetime
from typing import List, Optional, Any, Dict
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import json

# Internal imports
from src.database import get_db, init_db, Conversation, Message
from src.models.schemas import (
    MessageRequest,
    MessageResponse,
    ConversationHistory,
    HealthResponse,
    ErrorResponse,
)
from src.services.ai_service import AIService

# Load configuration
load_dotenv()

# Logger setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
)
logger = logging.getLogger("chatbot-ia-api")

app = FastAPI(
    title="Chatbot IA API",
    description="API robusta para chatbots modernos alimentados por IA generativa.",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AI Service Instance
ai_service = AIService()

# Constants
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

@app.on_event("startup")
async def startup_event():
    """Initialize system on startup."""
    try:
        init_db()
        logger.info("Database and system initialized successfully.")
    except Exception as e:
        logger.critical(f"System startup failed: {e}")

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check for API and dependencies."""
    db_ok = True
    try:
        db.execute("SELECT 1")
    except:
        db_ok = False
        
    return HealthResponse(
        status="active",
        version="2.0.0",
        timestamp=datetime.utcnow(),
        database_connected=db_ok,
        ai_model_ready=True, # Assuming service init didn't fail
    )

@app.post("/chat", response_model=MessageResponse, tags=["Chat"])
async def chat_interaction(
    request: MessageRequest,
    db: Session = Depends(get_db),
):
    """Process a chat interaction (Standard JSON response)."""
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Get or create conversation
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if not conversation:
            conversation = Conversation(
                id=conversation_id,
                user_id=request.user_id,
                title=request.content[:50],
            )
            db.add(conversation)
            db.commit()

        # Fetch context
        history = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
        context = [(m.user_message, m.ai_response) for m in history]

        # Generate response
        response_text, tokens = await ai_service.generate_response(request.content, context)

        # Persistence
        new_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            user_message=request.content,
            ai_response=response_text,
            tokens_used=tokens,
        )
        db.add(new_message)
        db.commit()
        db.refresh(new_message)

        return MessageResponse(
            id=new_message.id,
            conversation_id=conversation_id,
            user_message=request.content,
            ai_response=response_text,
            timestamp=new_message.created_at,
            tokens_used=tokens,
        )

    except Exception as e:
        logger.error(f"Chat processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream", tags=["Chat"])
async def chat_stream(
    request: MessageRequest,
    db: Session = Depends(get_db),
):
    """Process a chat interaction with Server-Sent Events (SSE) streaming."""
    async def event_generator():
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Immediate CID feedback
        yield f"data: {json.dumps({'type': 'setup', 'conversation_id': conversation_id})}\n\n"

        # Context fetch (sync but handled by FastAPI threadpool)
        history = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
        context = [(m.user_message, m.ai_response) for m in history]

        full_response_parts = []
        async for chunk in ai_service.stream_response(request.content, context):
            full_response_parts.append(chunk)
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"

        full_response = "".join(full_response_parts)
        
        # Save to DB (Synchronous)
        try:
            conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
            if not conversation:
                conversation = Conversation(
                    id=conversation_id,
                    user_id=request.user_id,
                    title=request.content[:50],
                )
                db.add(conversation)
            
            msg = Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                user_message=request.content,
                ai_response=full_response,
                tokens_used=0, # Estimated or fixed
            )
            db.add(msg)
            db.commit()
            yield f"data: {json.dumps({'type': 'done', 'message_id': msg.id})}\n\n"
        except Exception as e:
            logger.error(f"Error saving streamed response: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': 'Failed to save message'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Conversation Management
@app.get("/conversations", tags=["Conversations"])
async def get_conversations(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List conversations for a user."""
    query = db.query(Conversation)
    if user_id:
        query = query.filter(Conversation.user_id == user_id)
    
    conversations = query.order_by(Conversation.updated_at.desc()).all()
    return {
        "conversations": [
            {
                "id": c.id,
                "title": c.title,
                "created_at": c.created_at,
                "updated_at": c.updated_at,
                "messages_count": len(c.messages)
            } for c in conversations
        ]
    }

@app.get("/conversation/{conversation_id}", response_model=ConversationHistory, tags=["Conversations"])
async def get_conversation_history(conversation_id: str, db: Session = Depends(get_db)):
    """Retrieve full history of a conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return ConversationHistory(
        conversation_id=conv.id,
        user_id=conv.user_id,
        messages=[
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                user_message=m.user_message,
                ai_response=m.ai_response,
                timestamp=m.created_at,
                tokens_used=m.tokens_used
            ) for m in conv.messages
        ],
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        total_messages=len(conv.messages)
    )

@app.delete("/conversation/{conversation_id}", tags=["Conversations"])
async def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    """Hard delete of a conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conv)
    db.commit()
    return {"status": "success", "message": "Conversation deleted"}

# Static Files & Frontend
@app.get("/", tags=["UI"])
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

# Serve other static files
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_DEBUG", "True").lower() == "true",
    )
