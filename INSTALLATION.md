# 🚀 Guia de Instalação - Chatbot IA API

Um guia passo a passo para instalar e configurar a API de chatbot alimentada por IA.

## 📋 Pré-requisitos

- **Python 3.8+** (Verifique: `python --version`)
- **pip** ou **conda** para gerenciar pacotes
- **Git** (para clonar o repositório)
- Chave de API ou modelo local:
  - OpenAI API key OU
  - Ollama instalado localmente OU
  - Hugging Face API key

## 🔧 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/matheussiqueira-dev/chatbot-ia-api.git
cd chatbot-ia-api
```

### 2. Crie um Ambiente Virtual

#### Windows:
```powershell
python -m venv venv
venv\Scripts\activate
```

#### Linux/macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Opcional** - Para desenvolvimento:
```bash
pip install -r requirements-dev.txt
```

### 4. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

#### Opção A: OpenAI (Recomendado)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-seu-codigo-aqui
OPENAI_MODEL=gpt-3.5-turbo

DATABASE_URL=sqlite:///./chatbot.db
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
```

Como obter uma chave OpenAI:
1. Acesse https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Gere uma nova chave
4. Cole em `OPENAI_API_KEY`

#### Opção B: Ollama (Local e Gratuito)

Primeiro, instale e execute Ollama:

**Windows/macOS:**
- Download: https://ollama.ai
- Instale e execute `ollama serve`

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

Depois, em outro terminal:
```bash
ollama pull mistral  # ou outro modelo: llama2, neural-chat, etc
```

Configure `.env`:
```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

DATABASE_URL=sqlite:///./chatbot.db
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
```

#### Opção C: Hugging Face

Como obter uma chave:
1. Acesse https://huggingface.co/settings/tokens
2. Crie um novo token com acesso de leitura
3. Cole em `HUGGINGFACE_API_KEY`

Configure `.env`:
```env
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_seu_codigo_aqui
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1

DATABASE_URL=sqlite:///./chatbot.db
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
```

### 5. Inicialize o Banco de Dados

```bash
python -c "from src.database import init_db; init_db()"
```

## 🏃 Executando a API

### Modo Desenvolvimento (Com Auto-reload)

```bash
python -m uvicorn src.main:app --reload
```

### Modo Produção

```bash
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Saída esperada:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

## 📚 Acessar a API

Após iniciar a API, acesse:

- **API**: http://localhost:8000
- **Swagger UI (Documentação Interativa)**: http://localhost:8000/docs
- **ReDoc (Documentação Alternativa)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## ✅ Teste Rápido

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database_connected": true,
  "ai_model_ready": true
}
```

### 2. Enviar Mensagem

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"Olá! Como você está?"}'
```

### 3. Usar Client Python

```bash
python example_client.py
```

## 🐳 Usar com Docker

### Pré-requisito
- Docker instalado: https://www.docker.com/products/docker-desktop

### Build e Run

```bash
# Build da imagem
docker build -t chatbot-ia-api .

# Run do container
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-seu-codigo \
  -e AI_PROVIDER=openai \
  chatbot-ia-api
```

### Com Docker Compose

```bash
# Edite docker-compose.yml com suas credenciais
nano docker-compose.yml

# Execute
docker-compose up -d

# Veja os logs
docker-compose logs -f chatbot-api

# Pare o serviço
docker-compose down
```

## 🧪 Testes

```bash
# Instale dependências de teste
pip install -r requirements-dev.txt

# Execute todos os testes
pytest

# Com cobertura
pytest --cov=src tests/

# Modo verbose
pytest -v
```

## 🔍 Troubleshooting

### "ModuleNotFoundError: No module named 'src'"

**Solução:**
```bash
# Certifique-se de estar no diretório correto
cd chatbot-ia-api

# Verifique se venv está ativado
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
```

### "Connection refused" ao conectar em Ollama

**Solução:**
1. Verifique se Ollama está rodando: `ollama serve`
2. Verifique `OLLAMA_BASE_URL` em `.env`
3. Tente: `curl http://localhost:11434/api/tags`

### "Invalid API key" (OpenAI)

**Solução:**
1. Verifique se a chave está correta em `.env`
2. Verifique se tem créditos na conta OpenAI
3. Tente gerar uma nova chave em https://platform.openai.com/api-keys

### "503 Service Unavailable"

**Solução:**
1. Verifique se `.env` está configurado corretamente
2. Verifique a conectividade com o provedor de IA
3. Consulte os logs: `tail -f logs/api.log`

### Porta 8000 já em uso

**Solução:**
```bash
# Mude a porta em .env
API_PORT=8001

# Ou mate o processo usando a porta
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8000
kill -9 <PID>
```

## 📊 Verificar Instalação

Execute este script para verificar se tudo está funcionando:

```python
# verify_installation.py
import sys
import subprocess

checks = [
    ("Python version", lambda: sys.version),
    ("FastAPI", lambda: __import__('fastapi').__version__),
    ("SQLAlchemy", lambda: __import__('sqlalchemy').__version__),
    ("Pydantic", lambda: __import__('pydantic').__version__),
]

print("🔍 Verificando Instalação\n")
for name, check in checks:
    try:
        version = check()
        print(f"✅ {name}: {version}")
    except Exception as e:
        print(f"❌ {name}: {str(e)}")

# Verificar .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    import os
    if os.getenv("OPENAI_API_KEY") or os.getenv("OLLAMA_BASE_URL"):
        print(f"✅ Arquivo .env configurado")
    else:
        print(f"⚠️ Arquivo .env não configurado completamente")
except:
    print(f"⚠️ Arquivo .env não encontrado")

print("\n✨ Verificação completa!")
```

## 📞 Suporte

- **GitHub Issues**: https://github.com/matheussiqueira-dev/chatbot-ia-api/issues
- **Documentação**: Veja [docs/API.md](docs/API.md)
- **Exemplos**: Veja [example_client.py](example_client.py)

## 🎓 Próximos Passos

1. **Leia a Documentação**: [README.md](README.md) e [docs/API.md](docs/API.md)
2. **Explore os Endpoints**: Acesse http://localhost:8000/docs
3. **Teste com Exemplos**: `python example_client.py`
4. **Integre em seu App**: Use `example_client.py` como referência

## 📝 Licença

MIT License - veja [LICENSE](LICENSE)

---

**Pronto! Sua API de Chatbot IA está instalada e funcionando! 🚀**

Para iniciar: `python -m uvicorn src.main:app --reload`
