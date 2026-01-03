#!/bin/bash

# Script para fazer push do projeto para GitHub
# Use este script para enviar o código para seu repositório GitHub

set -e

echo "🚀 Preparando para fazer push para GitHub..."
echo ""

# Verificar se está em um repositório git
if [ ! -d .git ]; then
    echo "❌ Não é um repositório Git!"
    echo "Inicializando Git..."
    git init
    git remote add origin https://github.com/matheussiqueira-dev/chatbot-ia-api.git
fi

# Verificar status
echo "📋 Status do Git:"
git status

echo ""
echo "📝 Adicionando arquivos..."
git add .

echo ""
echo "💬 Digite sua mensagem de commit (ou pressione Enter para usar a padrão):"
read -p "Mensagem: " commit_message

if [ -z "$commit_message" ]; then
    commit_message="Implementação inicial da Chatbot IA API"
fi

echo ""
echo "📤 Fazendo commit..."
git commit -m "$commit_message"

echo ""
echo "🔄 Fazendo push para GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Sucesso! Seu código foi enviado para GitHub!"
echo "Acesse: https://github.com/matheussiqueira-dev/chatbot-ia-api"
