"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class MessageRequest(BaseModel):
    """Schema for incoming chat message."""
    content: str = Field(..., min_length=1, max_length=2000, description="User message content")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context")
    user_id: Optional[str] = Field(None, description="User identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Hello, how can you help me?",
                "conversation_id": "conv_123",
                "user_id": "user_456"
            }
        }


class MessageResponse(BaseModel):
    """Schema for chatbot response."""
    id: str = Field(..., description="Message ID")
    conversation_id: str = Field(..., description="Conversation ID")
    user_message: str = Field(..., description="Original user message")
    ai_response: str = Field(..., description="AI generated response")
    timestamp: datetime = Field(..., description="Message timestamp")
    tokens_used: int = Field(0, description="Tokens used in this interaction")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "msg_789",
                "conversation_id": "conv_123",
                "user_message": "Hello, how can you help me?",
                "ai_response": "I can assist you with various tasks. What would you like help with?",
                "timestamp": "2024-01-15T10:30:00Z",
                "tokens_used": 45
            }
        }


class ConversationHistory(BaseModel):
    """Schema for conversation history."""
    conversation_id: str = Field(..., description="Conversation ID")
    user_id: Optional[str] = Field(None, description="User identifier")
    messages: List[MessageResponse] = Field(..., description="List of messages in conversation")
    created_at: datetime = Field(..., description="Conversation creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    total_messages: int = Field(..., description="Total message count")

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "conv_123",
                "user_id": "user_456",
                "messages": [],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
                "total_messages": 5
            }
        }


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    error_code: Optional[str] = Field(None, description="Error code for handling")

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Invalid request",
                "detail": "Message content cannot be empty",
                "error_code": "INVALID_MESSAGE"
            }
        }


class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(..., description="Current timestamp")
    database_connected: bool = Field(..., description="Database connection status")
    ai_model_ready: bool = Field(..., description="AI model availability status")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "timestamp": "2024-01-15T10:30:00Z",
                "database_connected": True,
                "ai_model_ready": True
            }
        }
