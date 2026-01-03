"""AI service for handling chatbot interactions."""
import os
import logging
from abc import ABC, abstractmethod
from typing import List, Tuple
import requests

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        """Generate response from AI model.
        
        Args:
            prompt: User message
            conversation_history: List of (user_msg, ai_response) tuples for context
            
        Returns:
            Tuple of (response_text, tokens_used)
        """
        pass


class OpenAIProvider(AIProvider):
    """OpenAI API provider."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.base_url = "https://api.openai.com/v1"

        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")

    def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        """Generate response using OpenAI API."""
        try:
            messages = self._build_messages(prompt, conversation_history)

            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": float(os.getenv("TEMPERATURE", 0.7)),
                    "max_tokens": 1000,
                },
                timeout=30,
            )

            response.raise_for_status()
            data = response.json()

            ai_response = data["choices"][0]["message"]["content"]
            tokens_used = data.get("usage", {}).get("total_tokens", 0)

            logger.info(f"OpenAI response generated. Tokens: {tokens_used}")
            return ai_response, tokens_used

        except requests.exceptions.RequestException as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise Exception(f"Failed to get response from OpenAI: {str(e)}")

    def _build_messages(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> List[dict]:
        """Build message history for OpenAI API."""
        messages = [
            {
                "role": "system",
                "content": "You are a helpful AI assistant. Provide clear, accurate, and concise responses.",
            }
        ]

        # Add conversation history
        for user_msg, ai_msg in conversation_history:
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": ai_msg})

        # Add current prompt
        messages.append({"role": "user", "content": prompt})

        return messages


class OllamaProvider(AIProvider):
    """Ollama local model provider."""

    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "mistral")

    def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        """Generate response using Ollama local model."""
        try:
            # Build context from conversation history
            context = self._build_context(conversation_history)
            full_prompt = f"{context}\nUser: {prompt}\nAssistant:"

            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "temperature": float(os.getenv("TEMPERATURE", 0.7)),
                    "stream": False,
                },
                timeout=60,
            )

            response.raise_for_status()
            data = response.json()

            ai_response = data.get("response", "").strip()
            # Ollama doesn't provide token count, estimate it
            tokens_used = len(ai_response.split())

            logger.info(f"Ollama response generated. Estimated tokens: {tokens_used}")
            return ai_response, tokens_used

        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama API error: {str(e)}")
            raise Exception(f"Failed to get response from Ollama: {str(e)}")

    def _build_context(self, conversation_history: List[Tuple[str, str]]) -> str:
        """Build conversation context string."""
        context_lines = []
        for user_msg, ai_msg in conversation_history[-5:]:  # Keep last 5 exchanges
            context_lines.append(f"User: {user_msg}")
            context_lines.append(f"Assistant: {ai_msg}")
        return "\n".join(context_lines)


class HuggingFaceProvider(AIProvider):
    """Hugging Face API provider."""

    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        self.model = os.getenv("HUGGINGFACE_MODEL", "mistralai/Mistral-7B-Instruct-v0.1")
        self.base_url = "https://api-inference.huggingface.co/models"

        if not self.api_key:
            raise ValueError("HUGGINGFACE_API_KEY environment variable is required")

    def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        """Generate response using Hugging Face API."""
        try:
            context = self._build_context(conversation_history)
            full_prompt = f"{context}User: {prompt}\nAssistant:"

            response = requests.post(
                f"{self.base_url}/{self.model}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "inputs": full_prompt,
                    "parameters": {
                        "max_length": 1000,
                        "temperature": float(os.getenv("TEMPERATURE", 0.7)),
                    },
                },
                timeout=30,
            )

            response.raise_for_status()
            data = response.json()

            if isinstance(data, list):
                ai_response = data[0].get("generated_text", "").strip()
            else:
                ai_response = data.get("generated_text", "").strip()

            tokens_used = len(ai_response.split())

            logger.info(f"Hugging Face response generated. Estimated tokens: {tokens_used}")
            return ai_response, tokens_used

        except requests.exceptions.RequestException as e:
            logger.error(f"Hugging Face API error: {str(e)}")
            raise Exception(f"Failed to get response from Hugging Face: {str(e)}")

    def _build_context(self, conversation_history: List[Tuple[str, str]]) -> str:
        """Build conversation context string."""
        context_lines = []
        for user_msg, ai_msg in conversation_history[-5:]:
            context_lines.append(f"User: {user_msg}")
            context_lines.append(f"Assistant: {ai_msg}")
        return "\n".join(context_lines) + "\n" if context_lines else ""


class AIService:
    """Main AI service that manages different providers."""

    def __init__(self):
        provider_name = os.getenv("AI_PROVIDER", "openai").lower()

        if provider_name == "openai":
            self.provider = OpenAIProvider()
        elif provider_name == "ollama":
            self.provider = OllamaProvider()
        elif provider_name == "huggingface":
            self.provider = HuggingFaceProvider()
        else:
            raise ValueError(f"Unknown AI provider: {provider_name}")

        logger.info(f"AI Service initialized with provider: {provider_name}")

    def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        """Generate a response using the configured provider."""
        return self.provider.generate_response(prompt, conversation_history)

    def is_available(self) -> bool:
        """Check if AI provider is available."""
        try:
            # Try a simple test call
            self.generate_response("Hello", [])
            return True
        except Exception as e:
            logger.error(f"AI provider not available: {str(e)}")
            return False
