import React from 'react';
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Zap, 
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  Crown,
  Star,
  Sparkles,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
// ✅ CORREÇÃO: Usar o ThemeContext customizado ao invés do next-themes
import { useTheme } from '../context/ThemeContext';
import { useIAAnalytics } from '../src/hooks/useIAAnalytics';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function IAAndAnalyticsPage() {
  // ✅ CORREÇÃO: Usar o ThemeContext correto
  const { theme, resolvedTheme } = useTheme();
  useAuth();
  const { 
    metrics, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshMetrics,
    getPlanLimits,
    getUsagePercentage,
    isNearLimit
  } = useIAAnalytics();
  
  const userPlan = 'essencial';
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('7d');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Planos e limites
  const planLimits = getPlanLimits();
  const currentPlan = planLimits[userPlan as keyof typeof planLimits];

  // ✅ CORREÇÃO: Classes condicionais para tema com debug melhorado
  const isDark = resolvedTheme === 'dark';
  
  // Debug do tema
  React.useEffect(() => {
    console.log('🎨 [SISTEMA] Tema detectado:', { 
      theme, 
      resolvedTheme, 
      isDark,
      htmlClasses: document.documentElement.classList.toString()
    });
  }, [theme, resolvedTheme, isDark]);
  
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200';

  // Função para atualizar métricas
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMetrics();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
        <div className="flex flex-col items-center justify-center h-screen">
          <LoadingSpinner size="lg" />
          <span className={`mt-4 text-lg ${textClass} transition-colors duration-300`}>
            Carregando métricas de IA...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${bgClass} min-h-screen transition-colors duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
              IA & Analytics
            </h1>
            <p className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>
              Métricas e uso da Inteligência Artificial Finnextho
              {lastUpdated && (
                <span className="ml-2">
                  • Atualizado {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg border ${borderClass} ${textClass} hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700' : ''} disabled:opacity-50 transition-colors duration-300`}
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className={`px-3 py-2 border ${borderClass} rounded-lg text-sm ${textClass} ${isDark ? 'bg-gray-700' : 'bg-white'} transition-colors duration-300`}
          >
            <option value="1d">Último dia</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${isDark ? 'bg-red-900/20 border-red-800' : ''} transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'} transition-colors duration-300`}>{error}</span>
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* IA Status */}
        <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass} transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${textSecondaryClass} transition-colors duration-300`}>IA Finnextho</h3>
              <p className="text-2xl font-bold text-purple-600 capitalize">
                {metrics?.ai?.status || 'offline'}
              </p>
              <p className={`text-xs ${textSecondaryClass} transition-colors duration-300`}>
                {metrics?.ai?.requests?.today || 0}/{metrics?.ai?.requests?.limit || 0} requisições
              </p>
            </div>
            <div className={`p-2 ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'} rounded-lg transition-colors duration-300`}>
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={`${textSecondaryClass} transition-colors duration-300`}>Precisão</span>
              <span className={`${textClass} transition-colors duration-300`}>{metrics?.ai?.performance?.accuracy || 0}%</span>
            </div>
            <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1 transition-colors duration-300`}>
              <div 
                className="bg-purple-500 h-1 rounded-full" 
                style={{ width: `${metrics?.ai?.performance?.accuracy || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Chatbot Status */}
        <div className={`${cardBgClass} rounded-lg shadow p-4 border ${isDark ? 'border-blue-800' : 'border-blue-100'} transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${textSecondaryClass} transition-colors duration-300`}>Chatbot IA</h3>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {metrics?.chatbot?.status || 'offline'}
              </p>
              <p className={`text-xs ${textSecondaryClass} transition-colors duration-300`}>
                {metrics?.chatbot?.sessions?.active || 0} sessões ativas
              </p>
            </div>
            <div className={`p-2 ${isDark ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-lg transition-colors duration-300`}>
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={`${textSecondaryClass} transition-colors duration-300`}>Satisfação</span>
              <span className={`${textClass} transition-colors duration-300`}>{metrics?.chatbot?.performance?.satisfaction || 0}/5</span>
            </div>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-3 h-3 ${
                    star <= (metrics?.chatbot?.performance?.satisfaction || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : isDark ? 'text-gray-600' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orientação IA */}
        <div className={`${cardBgClass} rounded-lg shadow p-4 border ${isDark ? 'border-green-800' : 'border-green-100'} transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${textSecondaryClass} transition-colors duration-300`}>Orientação IA</h3>
              <p className="text-2xl font-bold text-green-600 capitalize">
                {metrics?.guidance?.status || 'offline'}
              </p>
              <p className={`text-xs ${textSecondaryClass} transition-colors duration-300`}>
                {metrics?.guidance?.activeJourneys || 0} jornadas ativas
              </p>
            </div>
            <div className={`p-2 ${isDark ? 'bg-green-900/50' : 'bg-green-100'} rounded-lg transition-colors duration-300`}>
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={`${textSecondaryClass} transition-colors duration-300`}>Progresso médio</span>
              <span className={`${textClass} transition-colors duration-300`}>{metrics?.guidance?.averageProgress || 0}%</span>
            </div>
            <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1 transition-colors duration-300`}>
              <div 
                className="bg-green-500 h-1 rounded-full" 
                style={{ width: `${metrics?.guidance?.averageProgress || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass} transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-medium ${textSecondaryClass} transition-colors duration-300`}>Saúde Financeira</h3>
              <p className={`text-2xl font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'} capitalize transition-colors duration-300`}>
                {metrics?.system?.status || 'unknown'}
              </p>
              <p className={`text-xs ${textSecondaryClass} transition-colors duration-300`}>
                Score: {metrics?.system?.financialHealth?.score || 0}/100
              </p>
            </div>
            <div className={`p-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors duration-300`}>
              <TrendingUp className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`} />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className={`${textSecondaryClass} transition-colors duration-300`}>Progresso</span>
              <span className={`${textClass} transition-colors duration-300`}>{metrics?.system?.goals?.completed || 0}/{metrics?.system?.goals?.total || 0}</span>
            </div>
            <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-1 transition-colors duration-300`}>
              <div 
                className={`${isDark ? 'bg-gray-400' : 'bg-gray-500'} h-1 rounded-full transition-colors duration-300`}
                style={{ 
                  width: `${metrics?.system?.goals?.total ? (metrics.system.goals.completed / metrics.system.goals.total) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug do Tema */}
      <div className={`${cardBgClass} rounded-lg shadow p-4 border ${borderClass} transition-colors duration-300`}>
        <h3 className={`text-lg font-semibold mb-2 ${textClass} transition-colors duration-300`}>Debug do Tema</h3>
        <div className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>
          <p>Tema selecionado: <span className="font-semibold">{theme}</span></p>
          <p>Tema aplicado: <span className="font-semibold">{resolvedTheme}</span></p>
          <p>Modo escuro: <span className="font-semibold">{isDark ? 'Sim' : 'Não'}</span></p>
          <p>Classes HTML: <span className="font-mono text-xs">{document.documentElement.classList.toString()}</span></p>
        </div>
      </div>

      {/* Gráficos e Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso de IA */}
        <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold flex items-center ${textClass} transition-colors duration-300`}>
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              Uso da IA
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>Plano atual:</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {currentPlan.name}
              </span>
            </div>
          </div>
          
          {/* Limites do plano */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Requisições IA</span>
                <span className={`${textClass} transition-colors duration-300`}>
                  {metrics?.ai?.requests?.today || 0}/{currentPlan.aiRequests}
                </span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
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
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Sessões Chatbot</span>
                <span className={`${textClass} transition-colors duration-300`}>
                  {metrics?.chatbot?.sessions?.active || 0}/{currentPlan.chatbotSessions}
                </span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className={`h-2 rounded-full ${
                    isNearLimit(metrics?.chatbot?.sessions?.active || 0, currentPlan.chatbotSessions) 
                      ? 'bg-red-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(metrics?.chatbot?.sessions?.active || 0, currentPlan.chatbotSessions)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Orientações IA</span>
                <span className={`${textClass} transition-colors duration-300`}>
                  {metrics?.guidance?.activeJourneys || 0}/{currentPlan.guidanceSessions}
                </span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className={`h-2 rounded-full ${
                    isNearLimit(metrics?.guidance?.activeJourneys || 0, currentPlan.guidanceSessions) 
                      ? 'bg-red-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${getUsagePercentage(metrics?.guidance?.activeJourneys || 0, currentPlan.guidanceSessions)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recursos do plano */}
          <div>
            <h4 className={`text-sm font-medium ${textClass} mb-2 transition-colors duration-300`}>Recursos incluídos:</h4>
            <div className="space-y-1">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                  <span className={`${textSecondaryClass} transition-colors duration-300`}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tópicos do Chatbot */}
        <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClass} transition-colors duration-300`}>
            <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
            Tópicos Mais Consultados
          </h3>
          <div className="space-y-3">
            {metrics?.chatbot?.topics?.map((topic: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
                  }}></div>
                  <span className={`text-sm ${textClass} transition-colors duration-300`}>{topic.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>{topic.count}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`}>({topic.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance e Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance da IA */}
        <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClass} transition-colors duration-300`}>
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Performance da IA
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Latência</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.ai?.performance?.latency || 0}ms</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (metrics?.ai?.performance?.latency || 0) / 2)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Throughput</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.ai?.performance?.throughput || 0} req/s</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics?.ai?.performance?.throughput || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Precisão</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.ai?.performance?.accuracy || 0}%</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${metrics?.ai?.performance?.accuracy || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Satisfação do Usuário */}
        <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClass} transition-colors duration-300`}>
            <Users className="w-5 h-5 mr-2 text-indigo-500" />
            Satisfação do Usuário
          </h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {metrics?.guidance?.userSatisfaction || 0}/5
            </div>
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`w-5 h-5 ${
                    star <= (metrics?.guidance?.userSatisfaction || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : isDark ? 'text-gray-600' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>
              {metrics?.guidance?.completedJourneys || 0} jornadas completadas
            </p>
          </div>
        </div>

        {/* Recursos do Sistema */}
        <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClass} transition-colors duration-300`}>
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Performance Financeira
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Saúde Financeira</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.system?.financialHealth?.score || 0}/100</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${metrics?.system?.financialHealth?.score || 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Dias Ativos</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.system?.userActivity?.activeDays || 0} dias</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (metrics?.system?.userActivity?.activeDays || 0) / 30 * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Metas Concluídas</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.system?.goals?.completed || 0}/{metrics?.system?.goals?.total || 0}</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ 
                    width: `${metrics?.system?.goals?.total ? (metrics.system.goals.completed / metrics.system.goals.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className={`${textSecondaryClass} transition-colors duration-300`}>Investimentos Ativos</span>
                <span className={`${textClass} transition-colors duration-300`}>{metrics?.system?.investments?.active || 0} ativos</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2 transition-colors duration-300`}>
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (metrics?.system?.investments?.active || 0) / 10 * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Recomendações */}
      <div className={`${cardBgClass} rounded-lg shadow p-6 border ${borderClass} transition-colors duration-300`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${textClass} transition-colors duration-300`}>
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Alertas e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isNearLimit(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests) && (
            <div className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-lg border transition-colors duration-300`}>
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'} transition-colors duration-300`}>Uso da IA próximo ao limite</h4>
                <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-700'} transition-colors duration-300`}>
                  Você já utilizou {getUsagePercentage(metrics?.ai?.requests?.today || 0, currentPlan.aiRequests).toFixed(0)}% das suas requisições de IA este mês. Considere fazer upgrade do plano.
                </p>
              </div>
            </div>
          )}
          
          <div className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} rounded-lg border transition-colors duration-300`}>
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'} transition-colors duration-300`}>Performance excelente</h4>
              <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                Sua IA está funcionando com {metrics?.ai?.performance?.accuracy || 0}% de precisão. Continue assim!
              </p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg border transition-colors duration-300`}>
            <Crown className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'} transition-colors duration-300`}>Upgrade recomendado</h4>
              <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'} transition-colors duration-300`}>
                Com o plano Top, você teria acesso a análises mais avançadas e suporte prioritário.
              </p>
            </div>
          </div>
          
          <div className={`flex items-start space-x-3 p-3 ${isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-lg border transition-colors duration-300`}>
            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className={`font-medium ${isDark ? 'text-purple-300' : 'text-purple-800'} transition-colors duration-300`}>Novos recursos disponíveis</h4>
              <p className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-700'} transition-colors duration-300`}>
                Experimente a orientação automática de IA para maximizar seus resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 