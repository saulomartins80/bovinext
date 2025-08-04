// Utilitário para tratamento centralizado de erros
interface ApiError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

export class ErrorHandler {
  static isNetworkError(error: ApiError): boolean {
    return !!(
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('network') ||
      error.message?.includes('timeout') ||
      error.message?.includes('ERR_INTERNET_DISCONNECTED')
    );
  }

  static isFirebaseAuthError(error: ApiError): boolean {
    return !!(
      error.code === 'auth/network-request-failed' ||
      error.code === 'auth/too-many-requests' ||
      error.message?.includes('Firebase') ||
      error.message?.includes('authentication')
    );
  }

  static getErrorMessage(error: ApiError): string {
    if (this.isNetworkError(error)) {
      return 'Problema de conectividade. Verifique sua conexão com a internet e tente novamente.';
    }

    if (this.isFirebaseAuthError(error)) {
      return 'Erro de autenticação. Tente fazer login novamente.';
    }

    if (error.response?.status === 404) {
      return 'Recurso não encontrado.';
    }

    if (error.response?.status === 401) {
      return 'Sessão expirada. Faça login novamente.';
    }

    if (error.response?.status && error.response.status >= 500) {
      return 'Erro interno do servidor. Tente novamente em alguns minutos.';
    }

    return error.message || 'Ocorreu um erro inesperado.';
  }

  static shouldRetry(error: ApiError): boolean {
    return !!(
      this.isNetworkError(error) ||
      (error.response?.status && error.response.status >= 500) ||
      error.code === 'auth/too-many-requests'
    );
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}

// Função para retry automático
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: ApiError = { message: 'Unknown error' };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as ApiError;
      
      if (!ErrorHandler.shouldRetry(lastError) || attempt === maxRetries) {
        throw error;
      }

      const delay = ErrorHandler.getRetryDelay(attempt);
      console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
} 