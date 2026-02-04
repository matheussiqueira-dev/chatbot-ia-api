# Demo - Chatbot IA API (Portfolio)

Este roteiro mostra o sistema funcionando com todas as funcionalidades.
Use como guia para gravar video ou fazer apresentacao ao vivo.

## 1) Pre-requisitos
- Python 3.8+
- Dependencias instaladas: `pip install -r requirements.txt`
- Arquivo `.env` configurado com um provedor de IA

Exemplo rapido (OpenAI):
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-3.5-turbo
```

## 2) Subir a API
```
python -m uvicorn src.main:app --reload
```

Abra a documentacao:
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 3) Demo automatizado (opcional)
Execute o script abaixo para percorrer todos os endpoints:
```
python portfolio_demo.py --base-url http://localhost:8000 --user-id portfolio_user
```

## 4) Demo manual (PowerShell)
```
$BASE_URL = "http://localhost:8000"
$USER_ID = "portfolio_user"

# Health check
$health = Invoke-RestMethod "$BASE_URL/health"
$health | ConvertTo-Json -Depth 5

# Root info
$root = Invoke-RestMethod "$BASE_URL/"
$root | ConvertTo-Json -Depth 5

# Criar conversa (POST /chat)
$first = Invoke-RestMethod "$BASE_URL/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{ content = "Ola! Quero uma demo completa."; user_id = $USER_ID } | ConvertTo-Json)
$first | ConvertTo-Json -Depth 5
$CONV_ID = $first.conversation_id

# Continuar conversa
$second = Invoke-RestMethod "$BASE_URL/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{ content = "Mostre as funcionalidades principais."; user_id = $USER_ID; conversation_id = $CONV_ID } | ConvertTo-Json)
$second | ConvertTo-Json -Depth 5

# Historico da conversa
$history = Invoke-RestMethod "$BASE_URL/conversation/$CONV_ID"
$history | ConvertTo-Json -Depth 6

# Listar conversas
$list = Invoke-RestMethod "$BASE_URL/conversations?user_id=$USER_ID&skip=0&limit=10"
$list | ConvertTo-Json -Depth 5

# Resetar conversa
$reset = Invoke-RestMethod "$BASE_URL/conversation/$CONV_ID/reset" -Method Post
$reset | ConvertTo-Json -Depth 5

# Ver historico apos reset
$history2 = Invoke-RestMethod "$BASE_URL/conversation/$CONV_ID"
$history2 | ConvertTo-Json -Depth 6

# Deletar conversa
$delete = Invoke-RestMethod "$BASE_URL/conversation/$CONV_ID" -Method Delete
$delete | ConvertTo-Json -Depth 5
```

## 5) Pontos para destacar no portfolio
- Multi-provedores (OpenAI, Ollama, Hugging Face)
- Persistencia de conversas no banco
- Documentacao automatica e health check
- Qualidade: validacao, logs e testes
- Deploy via Docker

