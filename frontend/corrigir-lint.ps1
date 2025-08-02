# Script para corrigir problemas de linting automaticamente
# Execute: .\corrigir-lint.ps1

Write-Host "🔧 Iniciando correção automática dos problemas de linting..." -ForegroundColor Green

# 1. Executar correções automáticas do ESLint
Write-Host "1️⃣ Executando correções automáticas do ESLint..." -ForegroundColor Blue
npm run lint -- --fix --max-warnings 999

# 2. Executar formatação do Prettier
Write-Host "2️⃣ Formatando código com Prettier..." -ForegroundColor Blue
npx prettier --write .

Write-Host "✅ Correções automáticas concluídas!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verificando resultado final..." -ForegroundColor Yellow

# 3. Verificar resultado
npm run lint

Write-Host ""
Write-Host "🎯 Se ainda houver erros, eles precisam ser corrigidos manualmente." -ForegroundColor Yellow
Write-Host "📝 Use os comandos:" -ForegroundColor Cyan
Write-Host "   npx eslint <arquivo> --fix      # Para corrigir arquivo específico" -ForegroundColor Gray
Write-Host "   npx eslint <arquivo>           # Para ver erros de arquivo específico" -ForegroundColor Gray
