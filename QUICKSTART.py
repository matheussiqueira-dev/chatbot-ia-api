"""Quick start guide for the Chatbot IA API."""

# QUICK START GUIDE - Chatbot IA API

## 1. Setup (5 minutos)

### 1.1 Instalar dependências
python -m venv venv
venv\Scripts\activate  # Windows
# ou: source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

### 1.2 Configurar .env
cp .env.example .env

# Edite .env e escolha seu provedor:

## Option A: OpenAI (recomendado para começar)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here

## Option B: Ollama (local, grátis)
# Instale Ollama: https://ollama.ai
# Rode: ollama serve (em outro terminal)
# Rode: ollama pull mistral
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

## Option C: Hugging Face
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_key_here

## 2. Executar a API

python -m uvicorn src.main:app --reload

# A API estará em: http://localhost:8000
# Docs em: http://localhost:8000/docs

## 3. Testar (em outro terminal)

### Teste 1: Health check
curl http://localhost:8000/health

### Teste 2: Enviar mensagem
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"content":"Olá! Como você está?"}'

### Teste 3: Usar cliente Python
python example_client.py

## 4. Estrutura importante

- src/main.py: API principal (endpoints)
- src/services/ai_service.py: Integração com IA
- src/database/: Banco de dados
- docs/API.md: Documentação completa
- docs/CURL_EXAMPLES.sh: Exemplos com cURL

## 5. Próximos passos

- Leia docs/API.md para documentação completa
- Explore example_client.py para integração
- Configure seu provedor de IA preferido
- Teste todos os endpoints em /docs

## Troubleshooting

### "ModuleNotFoundError"
python -m uvicorn src.main:app --reload

### "OPENAI_API_KEY not found"
- Verifique se .env existe
- Verifique se OPENAI_API_KEY está preenchida
- Reinicie a API

### "Connection refused" ao conectar em Ollama
- Verifique se Ollama está rodando: ollama serve
- Verifique OLLAMA_BASE_URL em .env
- Padrão é http://localhost:11434

### Erro 503 (AI service not available)
- Verifique credenciais de IA no .env
- Verifique conectividade com o provedor
- Confira logs da API

## Comandos úteis

# Criar banco de dados
python -c "from src.database import init_db; init_db(); print('DB created!')"

# Limpar conversas
python -c "from src.database import drop_db; drop_db(); print('DB cleared!')"

# Instalar em modo desenvolvimento
pip install -e .

# Rodar testes
pytest -v

# Format código
black src/ tests/

# Lint
flake8 src/ tests/

---

Pronto! Agora sua API de chatbot está funcionando! 🚀
"""
