// Tipos principais do chat

export type AutomatedAction = {
  type: string;
  payload?: any;
  confidence?: number;
  requiresConfirmation?: boolean;
  successMessage?: string;
  errorMessage?: string;
  followUpQuestions?: string[];
  isAutomated?: boolean;
  [key: string]: any;
};

export type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'assistant';
  content: string | React.ReactNode;
  timestamp: Date;
  metadata?: {
    action?: AutomatedAction;
    isError?: boolean;
    [key: string]: any;
  };
};

export type ChatSession = {
  chatId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
};

export type ChatState = {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  ui: {
    showSessions: boolean;
    showFeedbackModal: boolean;
    // outros estados de UI...
    [key: string]: any;
  };
}; 