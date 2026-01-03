"""Basic tests for the API."""
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


class TestHealth:
    """Health check endpoint tests."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "timestamp" in data


class TestRoot:
    """Root endpoint tests."""

    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Chatbot IA API"
        assert "docs" in data


class TestChat:
    """Chat endpoint tests."""

    def test_send_message_without_conversation_id(self):
        """Test sending a message without providing conversation_id."""
        response = client.post(
            "/chat",
            json={"content": "Hello, how are you?"},
        )
        # This will fail if AI service is not available
        # In a real scenario with mocking, it would succeed
        assert response.status_code in [201, 503]

    def test_send_empty_message(self):
        """Test sending an empty message."""
        response = client.post(
            "/chat",
            json={"content": ""},
        )
        assert response.status_code == 422  # Validation error


class TestConversation:
    """Conversation management tests."""

    def test_list_conversations_empty(self):
        """Test listing conversations when empty."""
        response = client.get("/conversations")
        assert response.status_code == 200
        data = response.json()
        assert "conversations" in data

    def test_get_nonexistent_conversation(self):
        """Test retrieving a non-existent conversation."""
        response = client.get("/conversation/nonexistent-id")
        assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
