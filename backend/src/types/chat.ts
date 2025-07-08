export interface ChatMessageMetadata {
  analysisData?: any;
  processingTime?: number;
  error?: boolean;
  errorMessage?: string;
  expertise?: string;
  confidence?: number;
  isImportant?: boolean;
  messageType?: 'basic' | 'premium' | 'analysis' | 'guidance' | 'streaming';
  messageId?: string;
  chunkCount?: number;
  isPremium?: boolean;
  actionExecuted?: boolean;
  actionType?: string;
  result?: any;
  action?: any;
  requiresConfirmation?: boolean;
  // ✅ NOVO: Propriedades para detecção de duplicatas
  duplicateDetected?: boolean;
  userDataAccessed?: {
    name: string;
    totalTransacoes: number;
    totalInvestimentos: number;
    totalMetas: number;
  };
  celebrations?: string[];
  motivationalMessage?: string;
  upsellMessage?: string;
  emotionalContext?: {
    stressLevel: number;
    recentEmotions: string[];
  };
  achievements?: {
    total: number;
    list: string[];
    points: number;
    level: number;
    streak: number;
  };
  // ✅ MELHORIA: Contexto da conversa expandido
  conversationContext?: {
    totalMessages: number;
    lastUserMessage?: string;
    conversationId: string;
    extractedContext?: any; // ✅ NOVO: Contexto extraído da conversa
  };
}

export interface ChatMessage {
  chatId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: ChatMessageMetadata;
  expiresAt?: Date;
  isImportant?: boolean;
  userId?: string;
}

export interface Conversation {
  chatId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isActive?: boolean;
  lastActivity?: Date;
}

// Tipo para listagem de sessões (sem mensagens completas)
export interface ChatSession {
  chatId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isActive?: boolean;
  lastActivity?: Date;
  messageCount?: number;
}

// Tipos para agregação de dados (permanentes)
export interface ChatAnalytics {
  userId: string;
  totalMessages: number;
  premiumMessages: number;
  averageResponseTime: number;
  commonTopics: string[];
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
} 