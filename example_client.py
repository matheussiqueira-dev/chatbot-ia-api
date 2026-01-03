"""Example usage of the Chatbot IA API."""
import requests
import json
from typing import Optional

BASE_URL = "http://localhost:8000"


class ChatbotClient:
    """Simple client for interacting with the Chatbot IA API."""

    def __init__(self, base_url: str = BASE_URL, user_id: Optional[str] = None):
        """Initialize the chatbot client.
        
        Args:
            base_url: API base URL
            user_id: Optional user identifier
        """
        self.base_url = base_url
        self.user_id = user_id
        self.conversation_id: Optional[str] = None

    def check_health(self) -> dict:
        """Check API health status."""
        response = requests.get(f"{self.base_url}/health")
        response.raise_for_status()
        return response.json()

    def send_message(self, content: str, conversation_id: Optional[str] = None) -> dict:
        """Send a message to the chatbot.
        
        Args:
            content: Message content
            conversation_id: Optional conversation ID (creates new if not provided)
            
        Returns:
            Response from the API
        """
        payload = {
            "content": content,
            "user_id": self.user_id,
        }

        if conversation_id:
            payload["conversation_id"] = conversation_id
            self.conversation_id = conversation_id
        elif self.conversation_id:
            payload["conversation_id"] = self.conversation_id

        response = requests.post(f"{self.base_url}/chat", json=payload)
        response.raise_for_status()
        data = response.json()

        # Store conversation ID for subsequent messages
        if not self.conversation_id:
            self.conversation_id = data["conversation_id"]

        return data

    def get_conversation_history(self, conversation_id: Optional[str] = None) -> dict:
        """Get conversation history.
        
        Args:
            conversation_id: Conversation ID (uses current if not provided)
            
        Returns:
            Conversation history
        """
        conv_id = conversation_id or self.conversation_id

        if not conv_id:
            raise ValueError("No conversation ID provided or set")

        response = requests.get(f"{self.base_url}/conversation/{conv_id}")
        response.raise_for_status()
        return response.json()

    def list_conversations(self, skip: int = 0, limit: int = 10) -> dict:
        """List conversations with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of conversations
        """
        params = {
            "skip": skip,
            "limit": limit,
        }

        if self.user_id:
            params["user_id"] = self.user_id

        response = requests.get(f"{self.base_url}/conversations", params=params)
        response.raise_for_status()
        return response.json()

    def reset_conversation(self, conversation_id: Optional[str] = None) -> dict:
        """Reset conversation (clear messages but keep conversation).
        
        Args:
            conversation_id: Conversation ID (uses current if not provided)
            
        Returns:
            Confirmation message
        """
        conv_id = conversation_id or self.conversation_id

        if not conv_id:
            raise ValueError("No conversation ID provided or set")

        response = requests.post(f"{self.base_url}/conversation/{conv_id}/reset")
        response.raise_for_status()
        return response.json()

    def delete_conversation(self, conversation_id: Optional[str] = None) -> dict:
        """Delete conversation.
        
        Args:
            conversation_id: Conversation ID (uses current if not provided)
            
        Returns:
            Confirmation message
        """
        conv_id = conversation_id or self.conversation_id

        if not conv_id:
            raise ValueError("No conversation ID provided or set")

        response = requests.delete(f"{self.base_url}/conversation/{conv_id}")
        response.raise_for_status()
        return response.json()

    def interactive_chat(self):
        """Start an interactive chat session."""
        print("=" * 60)
        print("Chatbot IA - Interactive Chat")
        print("=" * 60)
        print("Type 'quit' to exit, 'history' to see conversation history")
        print("=" * 60)
        print()

        while True:
            try:
                user_input = input("You: ").strip()

                if not user_input:
                    continue

                if user_input.lower() == "quit":
                    print("Goodbye!")
                    break

                if user_input.lower() == "history":
                    self._print_history()
                    continue

                # Send message and get response
                print("\n⏳ Waiting for response...")
                response = self.send_message(user_input)

                print(f"\nAssistant: {response['ai_response']}")
                print(f"(Conversation: {response['conversation_id'][:8]}...)")
                print(f"Tokens used: {response['tokens_used']}\n")

            except KeyboardInterrupt:
                print("\n\nChat interrupted. Goodbye!")
                break
            except requests.exceptions.RequestException as e:
                print(f"Error: {str(e)}")
            except Exception as e:
                print(f"Unexpected error: {str(e)}")

    def _print_history(self):
        """Print current conversation history."""
        try:
            history = self.get_conversation_history()
            print("\n" + "=" * 60)
            print("Conversation History")
            print("=" * 60)

            for i, msg in enumerate(history["messages"], 1):
                print(f"\n[{i}] {msg['timestamp']}")
                print(f"You: {msg['user_message']}")
                print(f"Assistant: {msg['ai_response']}")

            print("\n" + "=" * 60)
        except Exception as e:
            print(f"Error retrieving history: {str(e)}")


def main():
    """Main example function."""
    print("Chatbot IA API - Example Usage\n")

    # Initialize client
    client = ChatbotClient(user_id="example_user")

    # Check health
    print("1. Checking API health...")
    health = client.check_health()
    print(f"Status: {health['status']}")
    print(f"AI Model Ready: {health['ai_model_ready']}\n")

    if not health["ai_model_ready"]:
        print("⚠️ Warning: AI model is not available. Make sure to:")
        print("- Set up your AI provider (OpenAI, Ollama, Hugging Face)")
        print("- Configure the .env file correctly")
        print()

    # Send a message
    print("2. Sending a message...")
    try:
        response = client.send_message("Hello! What can you help me with?")
        print(f"Response: {response['ai_response']}")
        print(f"Conversation ID: {response['conversation_id']}\n")

        # Send another message in the same conversation
        print("3. Continuing the conversation...")
        response = client.send_message("Tell me more about your capabilities.")
        print(f"Response: {response['ai_response']}\n")

        # Get conversation history
        print("4. Retrieving conversation history...")
        history = client.get_conversation_history()
        print(f"Total messages: {history['total_messages']}")
        for msg in history["messages"]:
            print(f"  - User: {msg['user_message'][:50]}...")
        print()

        # List all conversations
        print("5. Listing conversations...")
        conversations = client.list_conversations()
        print(f"Total conversations: {conversations['total']}")
        for conv in conversations["conversations"]:
            print(f"  - {conv['id']}: {conv['message_count']} messages")
        print()

        # Start interactive chat (optional)
        print("6. Starting interactive chat (optional)...")
        response = input("Would you like to start an interactive chat? (y/n): ").lower()
        if response == "y":
            client.interactive_chat()

    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the API.")
        print("Make sure the API is running: python -m uvicorn src.main:app --reload")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
