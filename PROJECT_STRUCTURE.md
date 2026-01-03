# 📋 Estrutura Completa do Projeto - Chatbot IA API

## 🏗️ Organização do Projeto

```
chatbot-ia-api/
├── 📁 src/                          # Código-fonte principal
│   ├── __init__.py                  # Inicialização do pacote
│   ├── main.py                      # ⭐ Aplicação FastAPI (API principal)
│   │
│   ├── 📁 models/                   # Modelos de dados (Pydantic)
│   │   ├── __init__.py
│   │   └── schemas.py               # Schemas de requisição/resposta
│   │
│   ├── 📁 database/                 # Camada de dados
│   │   ├── __init__.py
│   │   ├── config.py                # Configuração SQLAlchemy
│   │   └── models.py                # Modelos ORM (Conversation, Message)
│   │
│   └── 📁 services/                 # Serviços de negócio
│       ├── __init__.py
│       └── ai_service.py            # 🤖 Integração com IA (OpenAI, Ollama, etc)
│
├── 📁 tests/                        # Testes unitários
│   ├── __init__.py
│   ├── conftest.py                  # Configuração do pytest
│   └── test_api.py                  # Testes da API
│
├── 📁 docs/                         # Documentação
│   ├── API.md                       # Documentação completa dos endpoints
│   └── CURL_EXAMPLES.sh             # Exemplos com cURL
│
├── 📄 Configuration Files
│   ├── .env.example                 # Variáveis de ambiente (exemplo)
│   ├── .gitignore                   # Arquivos a ignorar no Git
│   ├── setup.py                     # Configuração do pacote Python
│   └── requirements.txt             # Dependências principais
│
├── 📄 Development Files
│   ├── requirements-dev.txt         # Dependências de desenvolvimento
│   ├── Dockerfile                   # Configuração Docker
│   ├── docker-compose.yml           # Orquestração Docker
│   └── docker-build.sh              # Script para build Docker
│
├── 📄 Documentation
│   ├── README.md                    # ⭐ Documentação principal
│   ├── INSTALLATION.md              # Guia de instalação detalhado
│   └── QUICKSTART.py                # Início rápido
│
├── 📄 Examples & Tools
│   ├── example_client.py            # 💡 Cliente exemplo em Python
│   └── push_to_github.sh            # Script para fazer push no GitHub
│
└── 📄 License
    └── LICENSE                      # Licença MIT
```

## 📝 Descrição dos Arquivos Principais

### 1. **src/main.py** ⭐
Aplicação FastAPI principal com todos os endpoints da API.

**Endpoints inclusos:**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /chat` - Enviar mensagem
- `GET /conversation/{id}` - Obter histórico
- `GET /conversations` - Listar conversas
- `POST /conversation/{id}/reset` - Resetar conversa
- `DELETE /conversation/{id}` - Deletar conversa

### 2. **src/services/ai_service.py** 🤖
Serviço de inteligência artificial com suporte para múltiplos provedores.

**Provedores suportados:**
- OpenAI API
- Ollama (local)
- Hugging Face

### 3. **src/database/models.py**
Modelos ORM SQLAlchemy.

**Tabelas:**
- `Conversation` - Armazena metadados das conversas
- `Message` - Armazena mensagens e respostas

### 4. **src/models/schemas.py**
Schemas de validação Pydantic.

**Schemas:**
- `MessageRequest` - Requisição de mensagem
- `MessageResponse` - Resposta da API
- `ConversationHistory` - Histórico de conversa
- `HealthResponse` - Resposta de health check
- `ErrorResponse` - Resposta de erro

### 5. **README.md** ⭐
Documentação principal do projeto com:
- Características
- Requisitos
- Instalação
- Como executar
- Exemplos de uso
- Deploy
- Contribuindo

### 6. **INSTALLATION.md**
Guia passo a passo de instalação com:
- Pré-requisitos
- Instalação detalhada
- Configuração de cada provedor
- Testes
- Troubleshooting

### 7. **docs/API.md**
Documentação técnica completa da API com:
- Referência de endpoints
- Exemplos de requisições/respostas
- Fluxo de uso típico
- Códigos HTTP
- Estrutura do banco de dados

### 8. **example_client.py** 💡
Cliente Python pronto para usar, demonstrando:
- Como integrar com a API
- Chat interativo
- Gerenciamento de conversas
- Boas práticas

## 🚀 Como Usar Este Projeto

### 1. Instalação Rápida (5 min)
```bash
# Clone
git clone https://github.com/matheussiqueira-dev/chatbot-ia-api.git
cd chatbot-ia-api

# Setup
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Config
cp .env.example .env
# Edite .env com suas credenciais

# Execute
python -m uvicorn src.main:app --reload
```

### 2. Testar
```bash
# Via cURL
curl http://localhost:8000/health

# Via Python
python example_client.py

# Via Swagger
http://localhost:8000/docs
```

### 3. Publicar no GitHub
```bash
bash push_to_github.sh
```

## 🎯 Funcionalidades Implementadas

✅ API RESTful completa com FastAPI
✅ Banco de dados com SQLAlchemy
✅ Suporte para múltiplos provedores de IA
✅ Histórico persistente de conversas
✅ Validação de dados com Pydantic
✅ Logging detalhado
✅ Health check
✅ Docker support
✅ Documentação Swagger/OpenAPI
✅ Testes unitários
✅ Cliente exemplo
✅ Guia de instalação
✅ Exemplos com cURL

## 📦 Dependências Principais

```
fastapi           # Framework web
uvicorn           # Servidor ASGI
pydantic          # Validação de dados
sqlalchemy        # ORM para banco de dados
python-dotenv     # Gerenciar variáveis de ambiente
requests          # HTTP requests para APIs
```

## 🔐 Segurança

- Variáveis sensíveis em arquivo `.env`
- Validação de entrada com Pydantic
- Tratamento de erros apropriado
- Logging de atividades
- CORS configurável

## 📊 Banco de Dados

### Schema SQLite (padrão)
```sql
-- Conversas
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  title VARCHAR(255)
);

-- Mensagens
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) FOREIGN KEY,
  user_message TEXT,
  ai_response TEXT,
  tokens_used INTEGER,
  created_at DATETIME
);
```

## 🚀 Próximos Passos

1. **Instale e configure** seguindo [INSTALLATION.md](INSTALLATION.md)
2. **Execute a API** com `python -m uvicorn src.main:app --reload`
3. **Explore os endpoints** em http://localhost:8000/docs
4. **Teste com exemplos** em [example_client.py](example_client.py)
5. **Customize conforme sua necessidade**
6. **Deploy em produção** (veja Docker ou Heroku na documentação)

## 📞 Suporte e Contribuições

- **Issues**: https://github.com/matheussiqueira-dev/chatbot-ia-api/issues
- **Discussões**: GitHub Discussions
- **Email**: Seu email aqui

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE)

---

**Desenvolvido com ❤️ por Matheus Siqueira**

Para dúvidas, consulte:
- [README.md](README.md) - Documentação principal
- [docs/API.md](docs/API.md) - Referência da API
- [INSTALLATION.md](INSTALLATION.md) - Guia de instalação
- [example_client.py](example_client.py) - Exemplos de código
