# Guia de Integração Mobile

## Como integrar suas páginas com o novo sistema de navegação mobile

### 1. Importar o contexto

```typescript
import { useLayoutContext } from "../components/Layout";
```

### 2. Usar o contexto no componente

```typescript
const SuaPagina = () => {
  const { 
    registerAddItemCallback, 
    unregisterAddItemCallback, 
    registerExportPDFCallback, 
    unregisterExportPDFCallback 
  } = useLayoutContext();
  
  // ... resto do código
}
```

### 3. Registrar callbacks

```typescript
// Para páginas que têm função de adicionar item
useEffect(() => {
  registerAddItemCallback(() => {
    // Sua função de abrir modal/formulário
    setIsFormOpen(true);
  });
  
  return () => {
    unregisterAddItemCallback();
  };
}, [registerAddItemCallback, unregisterAddItemCallback]);

// Para páginas que têm função de exportar PDF
useEffect(() => {
  registerExportPDFCallback(() => {
    // Sua função de exportar PDF
    handleExportPDF();
  });
  
  return () => {
    unregisterExportPDFCallback();
  };
}, [registerExportPDFCallback, unregisterExportPDFCallback]);
```

### 4. Páginas que devem ser atualizadas

- ✅ **transacoes.tsx** - Já atualizada
- ⭐ **investimentos.tsx** - Precisa de callback de adicionar
- ⭐ **metas.tsx** - Precisa de callback de adicionar  
- ⭐ **milhas.tsx** - Precisa de callback de adicionar

### 5. Comportamento do botão central

**Página atual** | **Ação única** | **Ações múltiplas**
--- | --- | ---
Transações | ❌ | ✅ (Adicionar + PDF)
Investimentos | ✅ Adicionar | ❌
Metas | ✅ Adicionar | ❌
Milhas | ✅ Adicionar | ❌
Dashboard | ❌ | ✅ (Menu com todas as opções)

### 6. Exemplo de implementação para Investimentos

```typescript
// pages/investimentos.tsx
import { useLayoutContext } from "../components/Layout";

const InvestimentosDashboard = () => {
  const { registerAddItemCallback, unregisterAddItemCallback } = useLayoutContext();
  
  // Registrar callback
  useEffect(() => {
    registerAddItemCallback(() => {
      setForm({ open: true, mode: 'add', data: { data: '' } });
    });
    
    return () => {
      unregisterAddItemCallback();
    };
  }, [registerAddItemCallback, unregisterAddItemCallback]);
  
  // ... resto do código
}
```

### 7. Recursos do novo sistema

#### MobileHeader
- ✅ Aparece apenas no scroll para baixo
- ✅ Design moderno com blur e sombra
- ✅ Apenas botão do sidebar no lado esquerdo
- ✅ Título centralizado

#### MobileNavigation  
- ✅ Navegação inteligente entre páginas
- ✅ Botão central que se adapta ao contexto
- ✅ Menu em leque para múltiplas ações
- ✅ Chat sempre disponível no canto direito
- ✅ Design profissional com animações suaves

#### Sistema Inteligente
- ✅ Detecta automaticamente a página atual
- ✅ Adapta as ações disponíveis
- ✅ Integração perfeita com callbacks das páginas
- ✅ Fallback para navegação por URL quando necessário 