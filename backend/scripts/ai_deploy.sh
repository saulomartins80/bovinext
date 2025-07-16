#!/bin/bash
# 📂 scripts/ai_deploy.sh  

echo "🔄 Atualizando o chatbot com IA..."  
git pull origin main  
npm install  
ai-tool --optimize-responses  
systemctl restart chatbot-financeiro  

echo "✅ Chatbot atualizado e mais inteligente!" 