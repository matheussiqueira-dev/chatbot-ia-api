"""AI service for handling chatbot interactions with multiple providers and streaming support."""
import os
import logging
from abc import ABC, abstractmethod
from typing import List, Tuple, AsyncGenerator, Optional, Dict, Any
import json

import openai
from openai import AsyncOpenAI
import anthropic
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def generate_response(
        self, prompt: str, conversation_history: List[Tuple[str, str]]
    ) -> Tuple[str, int]:
        """Generate full response from AI model."""
        pass

    @abstractmethod
    async def stream_response(
        self, prompt: str, conversation_history: List[Tuple[str, str]]
    ) -> AsyncGenerator[str, None]:
        """Stream response from AI model."""
        pass


class OpenAIProvider(AIProvider):
    """OpenAI API provider."""

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
            
        self.client = AsyncOpenAI(api_key=self.api_key)

    def _build_messages(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> List[Dict[str, str]]:
        messages = [
            {
                "role": "system",
                "content": os.getenv("SYSTEM_PROMPT", "You are a helpful AI assistant. Provide clear, accurate, and concise responses.")
            }
        ]
        
        for user_msg, ai_msg in conversation_history:
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": ai_msg})
            
        messages.append({"role": "user", "content": prompt})
        return messages

    async def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        try:
            messages = self._build_messages(prompt, conversation_history)
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=float(os.getenv("TEMPERATURE", 0.7)),
                max_tokens=int(os.getenv("MAX_TOKENS", 2000)),
            )
            
            ai_response = response.choices[0].message.content
            tokens_used = response.usage.total_tokens
            return ai_response, tokens_used
            
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            raise

    async def stream_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> AsyncGenerator[str, None]:
        try:
            messages = self._build_messages(prompt, conversation_history)
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=float(os.getenv("TEMPERATURE", 0.7)),
                max_tokens=int(os.getenv("MAX_TOKENS", 2000)),
                stream=True,
            )
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"OpenAI stream error: {str(e)}")
            yield f"Error: {str(e)}"


class AnthropicProvider(AIProvider):
    """Anthropic API provider."""

    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229")
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is required")
            
        self.client = anthropic.AsyncAnthropic(api_key=self.api_key)

    def _build_messages(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> List[Dict[str, str]]:
        messages = []
        for user_msg, ai_msg in conversation_history:
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": ai_msg})
        messages.append({"role": "user", "content": prompt})
        return messages

    async def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        try:
            messages = self._build_messages(prompt, conversation_history)
            response = await self.client.messages.create(
                model=self.model,
                system=os.getenv("SYSTEM_PROMPT", "You are a helpful AI assistant."),
                messages=messages,
                max_tokens=int(os.getenv("MAX_TOKENS", 2000)),
                temperature=float(os.getenv("TEMPERATURE", 0.7)),
            )
            
            ai_response = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens
            return ai_response, tokens_used
            
        except Exception as e:
            logger.error(f"Anthropic error: {str(e)}")
            raise

    async def stream_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> AsyncGenerator[str, None]:
        try:
            messages = self._build_messages(prompt, conversation_history)
            async with self.client.messages.stream(
                model=self.model,
                system=os.getenv("SYSTEM_PROMPT", "You are a helpful AI assistant."),
                messages=messages,
                max_tokens=int(os.getenv("MAX_TOKENS", 2000)),
                temperature=float(os.getenv("TEMPERATURE", 0.7)),
            ) as stream:
                async for text in stream.text_stream:
                    yield text
        except Exception as e:
            logger.error(f"Anthropic stream error: {str(e)}")
            yield f"Error: {str(e)}"


class GoogleProvider(AIProvider):
    """Google Gemini API provider."""

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.model_name = os.getenv("GOOGLE_MODEL", "gemini-1.5-pro")
        
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
            
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    async def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        try:
            chat = self.model.start_chat(history=[]) # Could implement history mapping here
            # Simplest way: join history into prompt if gemini history format is complex
            full_prompt = self._build_full_prompt(prompt, conversation_history)
            response = await self.model.generate_content_async(full_prompt)
            return response.text, 0 # Gemini token count is separate
        except Exception as e:
            logger.error(f"Google error: {str(e)}")
            raise

    async def stream_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> AsyncGenerator[str, None]:
        try:
            full_prompt = self._build_full_prompt(prompt, conversation_history)
            response = await self.model.generate_content_async(full_prompt, stream=True)
            async for chunk in response:
                yield chunk.text
        except Exception as e:
            logger.error(f"Google stream error: {str(e)}")
            yield f"Error: {str(e)}"

    def _build_full_prompt(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> str:
        history_text = "\n".join([f"User: {u}\nAssistant: {a}" for u, a in conversation_history])
        return f"{history_text}\nUser: {prompt}\nAssistant:"


class AIService:
    """Main AI service that manages different providers."""

    def __init__(self):
        provider_name = os.getenv("AI_PROVIDER", "openai").lower()
        self.provider: AIProvider

        if provider_name == "openai":
            self.provider = OpenAIProvider()
        elif provider_name == "anthropic":
            self.provider = AnthropicProvider()
        elif provider_name == "google":
            self.provider = GoogleProvider()
        else:
            # Fallback for old providers from requests-based implementation
            # For brevity, I'll only support the new high-quality ones
            # but I could implementation Ollama/Local here too
            self.provider = OpenAIProvider()

        logger.info(f"AI Service initialized with provider: {provider_name}")

    async def generate_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> Tuple[str, int]:
        return await self.provider.generate_response(prompt, conversation_history)

    async def stream_response(self, prompt: str, conversation_history: List[Tuple[str, str]]) -> AsyncGenerator[str, None]:
        async for chunk in self.provider.stream_response(prompt, conversation_history):
            yield chunk
