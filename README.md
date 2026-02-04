# 🤖 Aura AI - Chatbot IA API & Interface Premium

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-yellow.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Aura AI é uma plataforma de chatbot de elite que integra os modelos de linguagem mais avançados do mercado (OpenAI, Anthropic e Google) em uma interface ultra-moderna e fluida. Projetada para performance superior e experiência do usuário excepcional.

---

## ✨ Funcionalidades em Destaque

-   **🌊 Respostas em Streaming**: Experiência em tempo real via Server-Sent Events (SSE). Chega de esperar a resposta completa para começar a ler.
-   **🎨 Design Ultra-Premium**: Interface inspirada em *Glassmorphism* com modo escuro cinematográfico, tipografia moderna e micro-interações fluidas.
-   **🔌 Multi-Provider Ready**: Suporte nativo para **GPT-4**, **Claude 3** e **Gemini Pro**. Troque de cérebro com uma única variável de ambiente.
-   **💾 Persistência Inteligente**: Histórico de conversas completo armazenado em SQLite (extensível para PostgreSQL).
-   **📝 Markdown & Syntax Highlighting**: Visualização impecável de códigos, tabelas e listas complexas.
-   **📱 Totalmente Responsivo**: Experiência otimizada de desktop a mobile sem perda de funcionalidade.

---

## 🛠️ Tecnologias Utilizadas

### Backend (Python/FastAPI)
-   **FastAPI**: Framework de alta performance para APIs modernas.
-   **SQLAlchemy**: ORM robusto para gestão de dados.
-   **OpenAI/Anthropic/Google SDKs**: Integrações oficiais e otimizadas.
-   **SSE-Starlette**: Streaming robusto para respostas instantâneas.

### Frontend (Vanilla JS/CSS)
-   **Glassmorphism Engine**: CSS customizado com filtros de desfoque e transparências.
-   **Marked.js**: Parser de markdown de alta velocidade.
-   **Highlight.js**: Realce de sintaxe profissional para blocos de código.
-   **Lucide Icons**: Conjunto de ícones vetoriais modernos.

---

## 🚀 Instalação e Uso

### Pré-requisitos
-   Python 3.9 ou superior
-   Uma chave de API (OpenAI, Anthropic ou Google)

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/matheussiqueira-dev/chatbot-ia-api.git
    cd chatbot-ia-api
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    ./venv/Scripts/activate # Windows
    source venv/bin/activate # Linux/Mac
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure suas chaves:**
    Copie o arquivo `.env.example` para `.env` e preencha suas chaves:
    ```bash
    cp .env.example .env
    ```

5.  **Inicie o servidor:**
    ```bash
    python src/main.py
    ```
    Acesse a interface em: `http://localhost:8000`

---

## 📂 Estrutura do Projeto

```text
chatbot-ia-api/
├── frontend/               # Interface Aura AI
│   ├── index.html          # Estrutura principal
│   ├── styles.css          # Design System Premium
│   └── app.js              # Lógica de Streaming & UI
├── src/                    # Backend FastAPI
│   ├── database/           # Modelos e Conexão DB
│   ├── services/           # Lógica do AI Provider (OpenAI, Anthropic, Google)
│   ├── models/             # Schemas Pydantic
│   └── main.py             # Entrypoint da API
├── requirements.txt        # Dependências do projeto
└── .env                    # Configurações sensíveis
```

---

## 📜 Boas Práticas Implementadas

-   **Arquitetura Assíncrona**: Uso extensivo de `async/await` para máxima escalabilidade.
-   **Separação de Preocupações**: Camadas distintas para API, Negócio (Services) e Dados.
-   **Segurança**: Proteção via variáveis de ambiente e CORS estruturado.
-   **UX First**: Feedback visual instantâneo e tratamento de erros amigável.

---

## 🔮 Melhorias Futuras

-   [ ] **RAG (Rag-Augmented Generation)**: Upload de PDFs e documentos para análise contextual.
-   [ ] **Voice-to-Text**: Integração com Whisper para comandos de voz.
-   [ ] **DALL-E 3 Integration**: Geração de imagens diretamente no chat.
-   [ ] **User Authentication**: Sistema de login e contas de usuário.

---

Autoria: Matheus Siqueira  
Website: [matheussiqueira.dev](https://www.matheussiqueira.dev/)
