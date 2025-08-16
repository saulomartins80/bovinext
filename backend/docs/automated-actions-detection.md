# Automated Actions Detection System

## Overview

The Automated Actions Detection System is a natural and humanized AI-powered system that detects user intents from conversational messages and automatically executes financial actions.

## Main Rules

1. **ALWAYS** be natural and conversational like an experienced friend
2. **NEVER** be robotic or repetitive
3. **ALWAYS** ask for details when information is missing
4. **NEVER** create automatically with default values
5. **ALWAYS** confirm before executing actions
6. Use natural Brazilian language ("beleza", "valeu", "tranquilo")
7. Adapt tone based on context and user mood

## Intelligent Detection Patterns

### Create Goal (CREATE_GOAL)
- "Quero juntar R$ X para Y" → Extract valor_total, meta
- "Meta de R$ X para Y" → Extract valor_total, meta
- "Quero economizar R$ X" → Extract valor_total
- "Preciso guardar R$ X" → Extract valor_total
- "estou querendo add uma nova meta" → Ask naturally
- "quero criar uma meta" → Ask naturally
- "viagem para gramado" + valor → Extract meta, valor_total

### Create Transaction (CREATE_TRANSACTION)
- "Gastei R$ X no Y" → Extract valor, descricao, tipo=despesa
- "Recebi salário de R$ X" → Extract valor, descricao, tipo=receita
- "Paguei conta de Y R$ X" → Extract valor, descricao, tipo=despesa
- "Comprei X por R$ Y" → Extract valor, descricao, tipo=despesa
- "estou querendo add uma nova transação" → Ask naturally
- "quero registrar uma transação" → Ask naturally
- "quero registrar um despesa" → Ask naturally

### Create Investment (CREATE_INVESTMENT)
- "Comprei ações da X por R$ Y" → Extract nome, valor, tipo
- "Investi R$ X em Y" → Extract valor, nome, tipo
- "Apliquei R$ X em Y" → Extract valor, nome, tipo
- "estou querendo add um novo investimento" → Ask naturally
- "quero criar um investimento" → Ask naturally

### Conversation Continuations
- If user mentions "valor é X reais" and previous conversation mentioned transaction → CREATE_TRANSACTION
- If user says "é uma despesa" and previous conversation mentioned transaction → CREATE_TRANSACTION
- If user says "outras informações já passei" → Use previous conversation context
- If user says "não foi criada" or "não estou vendo" → Check if exists and create again

### Confirmations and Corrections
- "vamos nessa" → UNKNOWN (confirmation)
- "ok" → UNKNOWN (confirmation)
- "sim" → UNKNOWN (confirmation)
- "claro" → UNKNOWN (confirmation)
- "corrigir" → UNKNOWN (correction)
- "mudar" → UNKNOWN (correction)
- "não" → UNKNOWN (negation)

### Questions and Doubts
- "como funciona" → UNKNOWN (question)
- "o que posso fazer" → UNKNOWN (question)
- "tudo bem" → UNKNOWN (greeting)
- "tudo joia" → UNKNOWN (greeting)
- "beleza" → UNKNOWN (greeting)
- "tudo certo" → UNKNOWN (greeting)
- "oi" → UNKNOWN (greeting)
- "boa noite" → UNKNOWN (greeting)
- "bom dia" → UNKNOWN (greeting)

## Natural Questions (when information is missing)

- For goals: "Que legal! Qual valor você quer juntar e para qual objetivo?"
- For transactions: "Perfeito! Qual valor e o que foi essa transação?"
- For investments: "Ótimo! Qual valor, tipo e nome do investimento?"

## Data Extraction

### For Goals (CREATE_GOAL)
- `valor_total`: Total goal amount (only if mentioned)
- `meta`: Goal description (only if mentioned)
- `data_conclusao`: Deadline (only if mentioned)
- `categoria`: Goal category (only if mentioned)

### For Transactions (CREATE_TRANSACTION)
- `valor`: Transaction amount (only if mentioned)
- `descricao`: Description (only if mentioned)
- `tipo`: receita/despesa (only if mentioned)
- `categoria`: Category (only if mentioned)

### For Investments (CREATE_INVESTMENT)
- `nome`: Investment name (only if mentioned)
- `valor`: Invested amount (only if mentioned)
- `tipo`: Investment type (only if mentioned)

## Response Format

The system should respond with JSON containing:
- `intent`: Action type (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- `entities`: Extracted data in JSON format
- `confidence`: Detection confidence (0.0 to 1.0)
- `response`: Natural and conversational response
- `requiresConfirmation`: true only if sufficient data exists to create

## Performance Optimization

The system uses multiple detection layers:

1. **Cache Check** (0.1s) - Check previous similar requests
2. **Quick Detection** (0.2s) - Keyword-based pattern matching
3. **Context Analysis** (0.3s) - Analyze conversation history
4. **Full AI Analysis** (0.5s) - Complete intent detection with AI
5. **Default Response** - Fallback for unrecognized patterns

## Implementation Details

The system is implemented in `src/controllers/automatedActionsController.ts` with the following key functions:

- `detectUserIntent()` - Main detection orchestrator
- `detectQuickIntent()` - Fast keyword-based detection
- `analyzeConversationContext()` - Context-aware analysis
- `detectFullIntent()` - AI-powered complete analysis
- `executeActionInternal()` - Execute detected actions

