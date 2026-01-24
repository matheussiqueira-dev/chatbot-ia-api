# Form Handler DOM JS

Aplicação web em JavaScript puro para gerenciamento de formulários com validação em tempo real, eventos DOM e manipulação dinâmica de dados. O projeto envia dados sem recarregar a página, persiste cadastros no Local Storage e oferece uma UI moderna com Dark Mode.

## ✨ Destaques

- Layout em card com visual premium e responsivo
- Validação visual avançada (input/blur) com mensagens por campo
- Feedback de sucesso/erro em tempo real
- Lista dinâmica de usuários com contagem automática
- Persistência via Local Storage
- Dark Mode com preferência salva

## 🚀 Funcionalidades

- Envio de formulário sem recarregar a página (`preventDefault`)
- Validação simples e objetiva de campos obrigatórios
- Máscara segura de senha (apenas comprimento é exibido)
- Criação dinâmica de cards no DOM (`createElement` + `appendChild`)
- Limpeza completa da lista com um clique
- Estado vazio inteligente

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (Flexbox, Grid, variáveis e animações)
- JavaScript ES6+

## 📂 Estrutura do Projeto

```
.
├─ index.html
├─ style.css
└─ script.js
```

## ▶️ Como executar

1. Clone o repositório.
2. Abra o arquivo `index.html` no navegador.
3. (Opcional) Use uma extensão como Live Server para recarregar automaticamente.

## 🗃️ Persistência

Os cadastros ficam salvos no navegador através do Local Storage, permitindo que os dados reapareçam mesmo após recarregar a página.

## 🌗 Dark Mode

O modo escuro pode ser ativado pelo botão no topo da página. A preferência do usuário é armazenada e restaurada automaticamente.

## ⚛️ Versão React + Hooks

Há uma versão completa em React dentro da pasta `react-app`, mantendo as mesmas funcionalidades e UX com estados controlados, Local Storage e Dark Mode.

Para executar:

```
cd react-app
npm install
npm run dev
```

## 📸 Preview

![Preview da aplicação](assets/preview.svg)

## 📌 Roadmap (opcional)

- Hook personalizado de validação
- Filtragem e remoção individual de cadastros
- Deploy com GitHub Pages ou Vercel

---

👨‍💻 Desenvolvido para portfólio
