# IA & Analytics Page - Implementação Completa

## 📋 Visão Geral

A página de **IA & Analytics** foi completamente reformulada para suportar temas claro/escuro/sistema e integração com dados reais do backend. A implementação inclui:

- ✅ **Suporte a temas**: Claro, escuro e sistema
- ✅ **Dados reais do backend**: Integração com `IAAnalyticsService`
- ✅ **Hook personalizado**: `useIAAnalytics` para gerenciamento de estado
- ✅ **Atualizações em tempo real**: Refresh automático a cada 5 minutos
- ✅ **Tratamento de erros**: Fallback para dados mockados
- ✅ **Componentes responsivos**: Adaptação para diferentes tamanhos de tela

## 🎨 Suporte a Temas

### Implementação do Tema

```tsx
import { useTheme } from 'next-themes';

const { theme, resolvedTheme } = useTheme();
const isDark = resolvedTheme === 'dark';

// Classes condicionais
const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
const cardBgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
```

### Cores Adaptativas

- **Fundo**: `bg-gray-900` (escuro) / `bg-gray-50` (claro)
- **Cards**: `bg-gray-800` (escuro) / `bg-white` (claro)
- **Texto**: `text-gray-100` (escuro) / `text-gray-900` (claro)
- **Bordas**: `border-gray-700` (escuro) / `border-gray-200` (claro)

## 🔄 Hook Personalizado: useIAAnalytics

### Funcionalidades

```tsx
const { 
  metrics,           // Dados das métricas
  isLoading,         // Estado de carregamento
  error,            // Erro se houver
  lastUpdated,      // Última atualização
  refreshMetrics,   // Função para atualizar
  processInteraction, // Processar interação
  executeGuidanceAction, // Executar ação
  getPlanLimits,    // Obter limites do plano
  getUsagePercentage, // Calcular uso percentual
  isNearLimit       // Verificar se está próximo do limite
} = useIAAnalytics();
```

### Características

- **Atualização automática**: A cada 5 minutos
- **Fallback inteligente**: Dados mockados em caso de erro
- **Progresso do usuário**: Dados personalizados se logado
- **Cache local**: Evita requisições desnecessárias

## 📊 Integração com Backend

### Serviço IAAnalyticsService

```tsx
// Buscar métricas reais
const realMetrics = await IAAnalyticsService.getIAMetrics();

// Buscar progresso do usuário
if (user?.uid) {
  const userProgress = await IAAnalyticsService.getUserProgress();
  if (userProgress) {
    realMetrics.userProgress = userProgress;
  }
}
```

### Endpoints Utilizados

- `GET /rpa/guidance/metrics` - Métricas gerais de IA
- `GET /rpa/guidance/journey/progress` - Progresso do usuário
- `POST /rpa/guidance/interaction` - Processar interação
- `POST /rpa/guidance/action` - Executar ação

## 🎯 Componentes Principais

### 1. Status Cards

```tsx
// IA Status
<div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass}`}>
  <div className="flex items-center justify-between">
    <div>
      <h3 className={`text-sm font-medium ${textSecondaryClass}`}>IA Finnextho</h3>
      <p className="text-2xl font-bold text-purple-600 capitalize">
        {metrics?.ai?.status || 'offline'}
      </p>
    </div>
    <div className={`p-2 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg`}>
      <Brain className="w-6 h-6 text-purple-600" />
    </div>
  </div>
</div>
```

### 2. Gráficos de Uso

```tsx
// Uso da IA com limites do plano
<div className="space-y-3 mb-4">
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className={textSecondaryClass}>Requisições IA</span>
      <span className={textClass}>
        {metrics?.ai?.requests?.today || 0}/{currentPlan.aiRequests}
      </span>
    </div>
    <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
      <div 
        className={`h-2 rounded-full ${
          isNearLimit(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests) 
            ? 'bg-red-500' 
            : 'bg-purple-500'
        }`}
        style={{ 
          width: `${getUsagePercentage(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests)}%` 
        }}
      ></div>
    </div>
  </div>
</div>
```

### 3. Alertas Inteligentes

```tsx
// Alertas baseados em dados reais
{isNearLimit(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests) && (
  <div className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-lg border`}>
    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
    <div>
      <h4 className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
        Uso da IA próximo ao limite
      </h4>
      <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
        Você já utilizou {getUsagePercentage(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests).toFixed(0)}% das suas requisições de IA este mês.
      </p>
    </div>
  </div>
)}
```

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install next-themes recharts
```

### 2. Configurar ThemeProvider

```tsx
// _app.tsx
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

### 3. Configurar Tailwind CSS

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ... resto da configuração
}
```

## 📱 Responsividade

### Breakpoints

- **Mobile**: `grid-cols-1` - Cards empilhados
- **Tablet**: `md:grid-cols-2` - 2 colunas
- **Desktop**: `lg:grid-cols-4` - 4 colunas

### Adaptações

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Status Cards */}
</div>

// Gráficos responsivos
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Gráficos */}
</div>
```

## 🚀 Funcionalidades Avançadas

### 1. Refresh Manual

```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

const handleRefresh = async () => {
  setIsRefreshing(true);
  await refreshMetrics();
  setIsRefreshing(false);
};

<button
  onClick={handleRefresh}
  disabled={isRefreshing}
  className={`p-2 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''} disabled:opacity-50`}
>
  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
</button>
```

### 2. Indicador de Última Atualização

```tsx
{lastUpdated && (
  <span className="ml-2">
    • Atualizado {lastUpdated.toLocaleTimeString()}
  </span>
)}
```

### 3. Tratamento de Erros

```tsx
{error && (
  <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : ''}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
      </div>
      <button
        onClick={handleRefresh}
        className="text-sm text-red-600 hover:text-red-800 underline"
      >
        Tentar novamente
      </button>
    </div>
  </div>
)}
```

## 🎨 Personalização

### Cores dos Temas

```tsx
// Cores para gráficos
const textColor = isDark ? '#E5E7EB' : '#374151';
const gridColor = isDark ? '#374151' : '#E5E7EB';
const backgroundColor = isDark ? '#1F2937' : '#FFFFFF';

// Aplicar nos gráficos
<CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
<XAxis 
  dataKey="name" 
  tick={{ fill: textColor }}
  axisLine={{ stroke: gridColor }}
/>
```

### Animações

```tsx
// Loading spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>

// Refresh button
<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
```

## 🔍 Monitoramento

### Métricas Disponíveis

- **IA**: Status, modelos, requisições, performance
- **Chatbot**: Sessões, interações, tópicos, satisfação
- **Orientação**: Jornadas ativas, progresso, satisfação
- **Sistema**: CPU, memória, disco, rede

### Alertas Automáticos

- Uso próximo ao limite (80%+)
- Performance baixa
- Recomendações de upgrade
- Novos recursos disponíveis

## 📈 Próximos Passos

1. **Gráficos Interativos**: Adicionar mais tipos de gráficos
2. **Exportação**: Permitir exportar relatórios
3. **Notificações**: Alertas em tempo real
4. **Personalização**: Temas customizados
5. **Analytics Avançados**: Métricas mais detalhadas

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Tema não muda**: Verificar se `ThemeProvider` está configurado
2. **Dados não carregam**: Verificar conexão com backend
3. **Gráficos quebrados**: Verificar se `recharts` está instalado
4. **Performance lenta**: Verificar intervalos de atualização

### Debug

```tsx
// Log para debug
console.log('Tema atual:', resolvedTheme);
console.log('Métricas:', metrics);
console.log('Erro:', error);
```

---

A implementação está completa e pronta para uso! A página agora suporta temas, integra com dados reais e oferece uma experiência de usuário moderna e responsiva. 