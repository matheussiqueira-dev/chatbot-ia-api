# Chatbot IA API - Documentação

## API Endpoints Reference

### Authentication
Atualmente, a API não requer autenticação. Para implementar em produção, adicionar JWT tokens.

### Base URL
```
http://localhost:8000
```

---

## 📌 Endpoints Disponíveis

### 1. Health Check
Verifica o status da API e disponibilidade dos serviços.

```http
GET /health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00",
  "database_connected": true,
  "ai_model_ready": true
}
```

---

### 2. Root Endpoint
Retorna informações sobre a API.

```http
GET /
```

**Response (200 OK):**
```json
{
  "name": "Chatbot IA API",
  "version": "1.0.0",
  "description": "API para chatbot alimentado por IA",
  "docs": "/docs",
  "redoc": "/redoc",
  "health": "/health"
}
```

---

### 3. Enviar Mensagem
Envia uma mensagem para o chatbot e recebe resposta da IA.

```http
POST /chat
Content-Type: application/json

{
  "content": "Sua pergunta aqui",
  "conversation_id": "conv_123",  # Optional
  "user_id": "user_456"            # Optional
}
```

**Response (201 Created):**
```json
{
  "id": "msg_789",
  "conversation_id": "conv_123",
  "user_message": "Sua pergunta aqui",
  "ai_response": "Resposta da IA...",
  "timestamp": "2024-01-15T10:30:00Z",
  "tokens_used": 45
}
```

**Errors:**
- `400 Bad Request`: Conteúdo inválido
- `503 Service Unavailable`: Serviço de IA não disponível
- `500 Internal Server Error`: Erro ao processar mensagem

---

### 4. Obter Histórico de Conversa
Recupera todas as mensagens de uma conversa.

```http
GET /conversation/{conversation_id}
```

**Response (200 OK):**
```json
{
  "conversation_id": "conv_123",
  "user_id": "user_456",
  "messages": [
    {
      "id": "msg_1",
      "conversation_id": "conv_123",
      "user_message": "Olá",
      "ai_response": "Oi! Como posso ajudá-lo?",
      "timestamp": "2024-01-15T10:00:00Z",
      "tokens_used": 20
    }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "total_messages": 1
}
```

**Errors:**
- `404 Not Found`: Conversa não encontrada

---

### 5. Listar Conversas
Lista todas as conversas com paginação.

```http
GET /conversations
GET /conversations?user_id=user_456&skip=0&limit=10
```

**Query Parameters:**
- `user_id` (string, optional): Filtrar por ID do usuário
- `skip` (integer, default: 0): Número de registros a pular
- `limit` (integer, default: 10): Número máximo de registros

**Response (200 OK):**
```json
{
  "total": 5,
  "conversations": [
    {
      "id": "conv_123",
      "user_id": "user_456",
      "title": "Sua pergunta aqui",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "message_count": 3
    }
  ]
}
```

---

### 6. Resetar Conversa
Limpa todas as mensagens de uma conversa, mantendo a conversa.

```http
POST /conversation/{conversation_id}/reset
```

**Response (200 OK):**
```json
{
  "message": "Conversation reset successfully",
  "conversation_id": "conv_123"
}
```

**Errors:**
- `404 Not Found`: Conversa não encontrada

---

### 7. Deletar Conversa
Remove completamente uma conversa e todas suas mensagens.

```http
DELETE /conversation/{conversation_id}
```

**Response (200 OK):**
```json
{
  "message": "Conversation deleted successfully",
  "conversation_id": "conv_123"
}
```

**Errors:**
- `404 Not Found`: Conversa não encontrada

---

## 🔄 Fluxo de Uso Típico

### 1. Iniciar Conversa (implícito)
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"Olá!"}'
```
A API cria uma nova conversa automaticamente se `conversation_id` não for fornecido.

### 2. Continuar Conversa
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"E você?","conversation_id":"conv_123"}'
```

### 3. Ver Histórico
```bash
curl http://localhost:8000/conversation/conv_123
```

### 4. Limpar Histórico
```bash
curl -X POST http://localhost:8000/conversation/conv_123/reset
```

---

## 🚨 Códigos de Status HTTP

| Código | Significado | Quando |
|--------|-------------|--------|
| 200 | OK | Requisição bem-sucedida (GET, DELETE bem-sucedido) |
| 201 | Created | Novo recurso criado (POST bem-sucedido) |
| 400 | Bad Request | Dados inválidos enviados |
| 404 | Not Found | Recurso não encontrado |
| 422 | Unprocessable Entity | Validação Pydantic falhou |
| 500 | Internal Server Error | Erro no servidor |
| 503 | Service Unavailable | Serviço de IA não disponível |

---

## 💾 Estrutura do Banco de Dados

### Tabela: conversations
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(255)
);
```

### Tabela: messages
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) FOREIGN KEY,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Rate Limiting (Futura)

Planejado: Limitar 100 requisições por minuto por usuário.

---

## 📊 Monitoramento

### Logs
Os logs são salvos em `logs/api.log` com informações de:
- Requisições recebidas
- Respostas da IA
- Erros e exceções
- Tempo de processamento

### Exemplo de Log
```
2024-01-15 10:30:00 - src.main - INFO - Generated response for conversation: conv_123
2024-01-15 10:30:01 - src.main - INFO - Message stored: msg_789
```

---

## 🧪 Exemplos Completos

### Python (requests)
```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Health check
print(requests.get(f"{BASE_URL}/health").json())

# Send message
response = requests.post(
    f"{BASE_URL}/chat",
    json={
        "content": "What is Python?",
        "user_id": "user_001"
    }
)

data = response.json()
conv_id = data["conversation_id"]
print(f"AI: {data['ai_response']}")

# Get conversation
history = requests.get(f"{BASE_URL}/conversation/{conv_id}").json()
print(f"Total messages: {history['total_messages']}")

# List conversations
conversations = requests.get(f"{BASE_URL}/conversations?user_id=user_001").json()
print(f"Total conversations: {conversations['total']}")
```

### JavaScript (fetch)
```javascript
const BASE_URL = 'http://localhost:8000';

// Send message
const response = await fetch(`${BASE_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'What is JavaScript?',
    user_id: 'user_001'
  })
});

const data = await response.json();
console.log(`Conversation ID: ${data.conversation_id}`);
console.log(`AI Response: ${data.ai_response}`);

// Get history
const history = await fetch(`${BASE_URL}/conversation/${data.conversation_id}`)
  .then(r => r.json());

console.log(`Messages: ${history.total_messages}`);
```

### cURL
```bash
# Health check
curl http://localhost:8000/health | jq

# Send message
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you?",
    "user_id": "user_001"
  }' | jq

# Get conversation (substitua CONV_ID)
curl http://localhost:8000/conversation/CONV_ID | jq

# List conversations
curl "http://localhost:8000/conversations?skip=0&limit=5" | jq

# Delete conversation
curl -X DELETE http://localhost:8000/conversation/CONV_ID
```

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no [GitHub](https://github.com/matheussiqueira-dev/chatbot-ia-api/issues).

---

**Última atualização:** janeiro 2024
