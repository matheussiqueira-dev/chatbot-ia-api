"""Portfolio demo script for Chatbot IA API."""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any, Dict, Tuple

import requests


def header(title: str) -> None:
    line = "=" * 72
    print(f"\n{line}\n{title}\n{line}")


def request_json(method: str, url: str, **kwargs) -> Tuple[requests.Response, Any]:
    try:
        response = requests.request(method, url, timeout=30, **kwargs)
    except requests.exceptions.RequestException as exc:
        print(f"Erro de conexao: {exc}")
        sys.exit(1)

    try:
        data = response.json()
    except ValueError:
        data = response.text

    return response, data


def truncate(text: Any, limit: int = 160) -> str:
    if text is None:
        return ""
    value = str(text)
    if len(value) <= limit:
        return value
    return value[: limit - 3] + "..."


def print_json(data: Any) -> None:
    print(json.dumps(data, indent=2, ensure_ascii=True))


def summarize_health(data: Dict[str, Any]) -> None:
    print(f"status: {data.get('status')}")
    print(f"version: {data.get('version')}")
    print(f"database_connected: {data.get('database_connected')}")
    print(f"ai_model_ready: {data.get('ai_model_ready')}")


def summarize_root(data: Dict[str, Any]) -> None:
    print(f"name: {data.get('name')}")
    print(f"version: {data.get('version')}")
    print(f"docs: {data.get('docs')}")
    print(f"redoc: {data.get('redoc')}")
    print(f"health: {data.get('health')}")


def summarize_chat(data: Dict[str, Any]) -> None:
    print(f"conversation_id: {data.get('conversation_id')}")
    print(f"user_message: {truncate(data.get('user_message'), 120)}")
    print(f"ai_response: {truncate(data.get('ai_response'), 160)}")
    print(f"tokens_used: {data.get('tokens_used')}")


def summarize_history(data: Dict[str, Any]) -> None:
    print(f"conversation_id: {data.get('conversation_id')}")
    print(f"user_id: {data.get('user_id')}")
    print(f"total_messages: {data.get('total_messages')}")
    for i, msg in enumerate(data.get("messages", []), 1):
        user_msg = truncate(msg.get("user_message"), 80)
        ai_msg = truncate(msg.get("ai_response"), 80)
        print(f"- {i}. user: {user_msg}")
        print(f"  ai: {ai_msg}")


def summarize_conversations(data: Dict[str, Any]) -> None:
    print(f"total: {data.get('total')}")
    for conv in data.get("conversations", []):
        print(
            f"- {conv.get('id')} | messages: {conv.get('message_count')} | user: {conv.get('user_id')}"
        )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Portfolio demo for Chatbot IA API"
    )
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Base URL da API (padrao: http://localhost:8000)",
    )
    parser.add_argument(
        "--user-id",
        default="portfolio_user",
        help="User ID para a demo (padrao: portfolio_user)",
    )
    parser.add_argument(
        "--full",
        action="store_true",
        help="Mostra JSON completo em cada etapa",
    )
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    user_id = args.user_id

    header("1) Health check - GET /health")
    resp, data = request_json("GET", f"{base_url}/health")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_health(data if isinstance(data, dict) else {})

    header("2) Root info - GET /")
    resp, data = request_json("GET", f"{base_url}/")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_root(data if isinstance(data, dict) else {})

    header("3) Nova conversa - POST /chat")
    payload = {"content": "Ola! Quero uma demo completa.", "user_id": user_id}
    resp, data = request_json("POST", f"{base_url}/chat", json=payload)
    print(f"HTTP {resp.status_code}")
    if resp.status_code == 503:
        print("Servico de IA indisponivel. Verifique o .env e o provedor.")
        return 2
    if resp.status_code not in (200, 201):
        print_json(data)
        return 1
    if args.full:
        print_json(data)
    else:
        summarize_chat(data if isinstance(data, dict) else {})

    conversation_id = ""
    if isinstance(data, dict):
        conversation_id = data.get("conversation_id") or ""
    if not conversation_id:
        print("Nao foi possivel obter o conversation_id.")
        return 1

    header("4) Continuar conversa - POST /chat (mesmo conversation_id)")
    payload = {
        "content": "Mostre as funcionalidades principais.",
        "user_id": user_id,
        "conversation_id": conversation_id,
    }
    resp, data = request_json("POST", f"{base_url}/chat", json=payload)
    print(f"HTTP {resp.status_code}")
    if resp.status_code not in (200, 201):
        print_json(data)
        return 1
    if args.full:
        print_json(data)
    else:
        summarize_chat(data if isinstance(data, dict) else {})

    header("5) Historico - GET /conversation/{id}")
    resp, data = request_json("GET", f"{base_url}/conversation/{conversation_id}")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_history(data if isinstance(data, dict) else {})

    header("6) Listar conversas - GET /conversations")
    resp, data = request_json(
        "GET",
        f"{base_url}/conversations",
        params={"user_id": user_id, "skip": 0, "limit": 10},
    )
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_conversations(data if isinstance(data, dict) else {})

    header("7) Resetar conversa - POST /conversation/{id}/reset")
    resp, data = request_json("POST", f"{base_url}/conversation/{conversation_id}/reset")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        print_json(data if isinstance(data, dict) else {"message": data})

    header("8) Historico apos reset - GET /conversation/{id}")
    resp, data = request_json("GET", f"{base_url}/conversation/{conversation_id}")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_history(data if isinstance(data, dict) else {})

    header("9) Deletar conversa - DELETE /conversation/{id}")
    resp, data = request_json("DELETE", f"{base_url}/conversation/{conversation_id}")
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        print_json(data if isinstance(data, dict) else {"message": data})

    header("10) Listar conversas apos delete - GET /conversations")
    resp, data = request_json(
        "GET",
        f"{base_url}/conversations",
        params={"user_id": user_id, "skip": 0, "limit": 10},
    )
    print(f"HTTP {resp.status_code}")
    if args.full:
        print_json(data)
    else:
        summarize_conversations(data if isinstance(data, dict) else {})

    print("\nDemo finalizada com sucesso.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
