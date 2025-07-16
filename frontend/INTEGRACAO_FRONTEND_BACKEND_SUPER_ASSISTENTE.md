# 📚 INTEGRAÇÃO FRONTEND + BACKEND SUPER ASSISTENTE

## Objetivo
Garantir que o frontend do Finnextho absorva e reflita **toda a inteligência, automação e personalização** já implementadas no backend, entregando uma experiência de chatbot realmente moderna, proativa e humanizada.

---

## 1. O que o backend já entrega (e o frontend deve usar)
- **Respostas humanizadas** (via `human_responses.json`)
- **Sugestões de comandos** (`followUpQuestions`)
- **Recomendações** (`recommendations`)
- **Próximos passos** (`nextSteps`)
- **Ações automatizadas** (cards de ação)
- **Confirmação de ações** (`requiresConfirmation`)
- **Coleta progressiva de dados** (`missingFields`, `collectedData`)
- **Contexto (pessoal/empresarial)** (campo `context`)
- **Respostas de fallback variadas**

---

## 2. O que precisa ser feito no frontend

### **A) Processar e exibir todo o `metadata` do backend**
- [ ] Exibir **sugestões** (`followUpQuestions`) como botões de sugestão.
- [ ] Exibir **recomendações** (`recommendations`) como cards ou botões de ação.
- [ ] Exibir **próximos passos** (`nextSteps`) como lista ou cards.
- [ ] Exibir **cards de ação automatizada** apenas quando o backend retornar uma ação no metadata.
- [ ] Exibir **card de confirmação** quando `requiresConfirmation` for true.
- [ ] Exibir **formulário dinâmico** quando houver `missingFields`.
- [ ] Exibir **respostas de fallback** sorteando do `human_responses.json` quando o intent for `UNKNOWN`.

### **B) Enviar o contexto correto em cada requisição**
- [ ] Adicionar campo `context: 'personal' | 'business'` no body do fetch para o backend.
- [ ] Adicionar toggle visual para alternância de contexto (Nubank-like).

### **C) Exibir loading, feedback, cards e sugestões só quando apropriado**
- [ ] Mostrar spinner/feedback visual enquanto o bot está pensando.
- [ ] Exibir tempo de resposta do bot.
- [ ] Exibir botões de ação rápida para intents especiais.

### **D) Buscar dados reais do backend na página de sistema**
- [ ] Trocar qualquer fetch de dados mockados por chamadas reais à API do backend.
- [ ] Exibir dashboards, transações, metas, etc, separados por contexto.

### **E) UX e Personalização**
- [ ] Exibir respostas humanizadas de fallback.
- [ ] Exibir cards de ação, sugestões, loading, feedback, etc, conforme o metadata.
- [ ] Exibir contexto ativo (pessoal/empresarial) no topo do chat.
- [ ] Exibir sugestões de comandos após respostas genéricas.

---

## 3. Exemplo de integração (React/Next.js)

```tsx
// Envio de mensagem para o backend com contexto
fetch('/api/chatbot/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, context }) // context: 'personal' ou 'business'
});

// Exibir sugestões do metadata
if (response.metadata?.followUpQuestions) {
  // Renderize botões de sugestão
}
if (response.metadata?.recommendations) {
  // Renderize cards de recomendação
}
if (response.metadata?.nextSteps) {
  // Renderize próximos passos
}
if (response.metadata?.requiresConfirmation) {
  // Renderize card de confirmação
}
if (response.metadata?.missingFields) {
  // Renderize formulário dinâmico
}
if (response.intent === 'UNKNOWN') {
  // Sorteie resposta de human_responses.json
}
```

---

## 4. Checklist para integração perfeita
- [ ] O frontend processa e exibe todos os campos do metadata.
- [ ] O frontend envia o contexto correto em cada requisição.
- [ ] O frontend exibe respostas humanizadas de fallback.
- [ ] O frontend exibe cards de ação, sugestões, recomendações, próximos passos.
- [ ] O frontend exibe loading, feedback e confirmações só quando apropriado.
- [ ] O frontend busca dados reais do backend na página de sistema.
- [ ] O frontend exibe contexto ativo (pessoal/empresarial) de forma clara.

---

## 5. Pontos de atenção
- O backend já está pronto para entregar tudo isso — só precisa ser absorvido pelo frontend.
- O frontend deve ser o “espelho” da inteligência do backend.
- Teste todos os fluxos com usuários reais e ajuste conforme feedback.

---

**Este documento serve como referência para evolução, manutenção e integração do frontend com o Super Assistente IA Finnextho.** 