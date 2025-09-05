// frontend/lib/firebase/googleAuthEnhanced.ts
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  browserPopupRedirectResolver,
  type UserCredential,
  type Auth
} from 'firebase/auth';

// Enhanced Google Auth configuration
export class GoogleAuthEnhanced {
  private provider: GoogleAuthProvider;
  private auth: Auth;
  private isMobile: boolean;
  private maxRetries = 3;
  private baseDelay = 1000;
  private redirectResultChecked = false;
  private redirectResultPromise: Promise<UserCredential | null> | null = null;

  constructor(auth: Auth) {
    this.auth = auth;
    this.provider = new GoogleAuthProvider();
    this.isMobile = this.detectMobile();
    this.setupProvider();
  }

  private detectMobile(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private setupProvider(): void {
    // Enhanced scopes for better user data
    this.provider.addScope('email');
    this.provider.addScope('profile');
    this.provider.addScope('openid');

    // Optimized parameters
    this.provider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
      include_granted_scopes: 'true',
      hd: undefined, // Allow any domain
      ...(this.isMobile && {
        display: 'popup',
        response_type: 'code'
      })
    });
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${operationName} - Attempt ${attempt}/${this.maxRetries}`);
        return await operation();
      } catch (error) {
        const firebaseError = error as { code?: string; message?: string };
        
        // Don't retry certain errors
        const nonRetryableErrors = [
          'auth/popup-blocked',
          'auth/popup-closed-by-user',
          'auth/unauthorized-domain',
          'auth/operation-not-allowed',
          'auth/invalid-credential',
          'auth/user-cancelled'
        ];

        if (nonRetryableErrors.includes(firebaseError.code || '')) {
          console.log(`❌ Non-retryable error: ${firebaseError.code}`);
          throw error;
        }

        if (attempt === this.maxRetries) {
          console.error(`❌ Max retries exceeded for ${operationName}`);
          throw error;
        }

        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying ${operationName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async testConnectivity(): Promise<boolean> {
    try {
      // Test multiple endpoints for better reliability
      const tests = [
        fetch('https://accounts.google.com/favicon.ico', { 
          method: 'HEAD', 
          mode: 'no-cors', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        }),
        fetch('https://www.googleapis.com/favicon.ico', { 
          method: 'HEAD', 
          mode: 'no-cors', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        })
      ];

      await Promise.race(tests);
      console.log('✅ Google services connectivity confirmed');
      return true;
    } catch (error) {
      console.warn('⚠️ Google services connectivity test failed:', error);
      return false;
    }
  }

  private async validateAuthState(): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase Auth não foi inicializado');
    }

    if (!this.auth.config?.apiKey) {
      throw new Error('Firebase API Key não configurada');
    }

    if (!this.auth.config?.authDomain) {
      throw new Error('Firebase Auth Domain não configurado');
    }

    console.log('✅ Firebase Auth state validated');
  }

  public async signInWithPopup(): Promise<UserCredential> {
    await this.validateAuthState();
    
    console.log('🚀 Starting Google Sign-In with Popup');
    console.log('📱 Device type:', { isMobile: this.isMobile });

    // Test connectivity first
    const hasConnectivity = await this.testConnectivity();
    if (!hasConnectivity) {
      throw new Error('Não foi possível conectar aos serviços do Google. Verifique sua conexão.');
    }

    return this.retryOperation(async () => {
      return await signInWithPopup(this.auth, this.provider, browserPopupRedirectResolver);
    }, 'Google Sign-In Popup');
  }

  public async signInWithRedirect(): Promise<void> {
    await this.validateAuthState();
    
    console.log('🔄 Starting Google Sign-In with Redirect');
    
    return this.retryOperation(async () => {
      await signInWithRedirect(this.auth, this.provider);
    }, 'Google Sign-In Redirect');
  }

  public async handleRedirectResult(): Promise<UserCredential | null> {
    // Prevent multiple simultaneous calls
    if (this.redirectResultPromise) {
      console.log('🔄 Redirect result check already in progress, returning existing promise');
      return this.redirectResultPromise;
    }

    // If already checked once, return null to prevent loops
    if (this.redirectResultChecked) {
      console.log('ℹ️ Redirect result already checked, skipping');
      return null;
    }

    this.redirectResultPromise = this._handleRedirectResultInternal();
    return this.redirectResultPromise;
  }

  private async _handleRedirectResultInternal(): Promise<UserCredential | null> {
    try {
      console.log('🔍 Checking for redirect result...');
      
      // Mark as checked to prevent future calls
      this.redirectResultChecked = true;
      
      // Check if auth is properly initialized
      if (!this.auth) {
        console.warn('⚠️ Auth instance not initialized, skipping redirect result check');
        return null;
      }

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        console.log('ℹ️ Server-side rendering, skipping redirect result check');
        return null;
      }

      // Additional safety check
      if (!this.auth.app) {
        console.warn('⚠️ Firebase app not ready, skipping redirect result check');
        return null;
      }

      const result = await getRedirectResult(this.auth);
      
      if (result) {
        console.log('✅ Redirect result found:', {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName
        });
      } else {
        console.log('ℹ️ No redirect result found');
      }
      
      return result;
    } catch (error: unknown) {
      console.error('❌ Error handling redirect result:', error);
      
      // Handle specific Firebase auth errors gracefully
      const firebaseError = error as { code?: string };
      const errorCode = firebaseError?.code || '';
      const gracefulErrors = [
        'auth/argument-error',
        'auth/invalid-api-key',
        'auth/network-request-failed',
        'auth/too-many-requests'
      ];
      
      if (gracefulErrors.includes(errorCode)) {
        console.warn(`⚠️ Graceful handling of ${errorCode}, returning null`);
        return null;
      }
      
      throw error;
    } finally {
      // Clear the promise after completion
      this.redirectResultPromise = null;
    }
  }

  public async signIn(): Promise<UserCredential> {
    try {
      // Try popup first
      return await this.signInWithPopup();
    } catch (error) {
      const firebaseError = error as { code?: string; message?: string };
      
      console.log('🔄 Popup failed, checking if redirect fallback is needed...');
      console.log('Error code:', firebaseError.code);

      // Fallback to redirect for specific errors
      const redirectFallbackErrors = [
        'auth/popup-blocked',
        'auth/web-storage-unsupported',
        'auth/operation-not-supported-in-this-environment'
      ];

      if (redirectFallbackErrors.includes(firebaseError.code || '')) {
        console.log('🔄 Using redirect fallback...');
        await this.signInWithRedirect();
        // This will navigate away, so we throw a special error
        throw new Error('REDIRECTING_FOR_GOOGLE_SIGNIN');
      }

      // Re-throw other errors
      throw error;
    }
  }

  public getProviderInfo(): { isMobile: boolean; provider: string } {
    return {
      isMobile: this.isMobile,
      provider: 'google'
    };
  }
}

// Enhanced error handler for Google Auth
export class GoogleAuthErrorHandler {
  static getErrorMessage(error: { code?: string; message?: string }): string {
    const errorMessages: Record<string, string> = {
      'auth/popup-blocked': 'Pop-up bloqueado pelo navegador. Permita pop-ups para este site ou use o login por redirecionamento.',
      'auth/popup-closed-by-user': 'Login cancelado. Tente novamente.',
      'auth/network-request-failed': 'Erro de rede. Verifique sua conexão com a internet.',
      'auth/unauthorized-domain': 'Domínio não autorizado. Entre em contato com o suporte.',
      'auth/operation-not-allowed': 'Login com Google não está habilitado. Entre em contato com o suporte.',
      'auth/invalid-credential': 'Credenciais inválidas. Tente novamente.',
      'auth/user-cancelled': 'Login cancelado pelo usuário.',
      'auth/account-exists-with-different-credential': 'Já existe uma conta com este email usando um método de login diferente.',
      'auth/credential-already-in-use': 'Esta conta Google já está vinculada a outro usuário.',
      'auth/web-storage-unsupported': 'Armazenamento web não suportado. Verifique as configurações do navegador.',
      'auth/operation-not-supported-in-this-environment': 'Operação não suportada neste ambiente. Tente usar outro navegador.',
      'auth/timeout': 'Tempo limite excedido. Tente novamente.',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'
    };

    return errorMessages[error.code || ''] || error.message || 'Erro desconhecido no login com Google.';
  }

  static isRetryableError(error: { code?: string }): boolean {
    const nonRetryableErrors = [
      'auth/popup-blocked',
      'auth/popup-closed-by-user',
      'auth/unauthorized-domain',
      'auth/operation-not-allowed',
      'auth/invalid-credential',
      'auth/user-cancelled',
      'auth/account-exists-with-different-credential',
      'auth/credential-already-in-use'
    ];

    return !nonRetryableErrors.includes(error.code || '');
  }
}

// Utility functions for Google Auth diagnostics
export const GoogleAuthDiagnostics = {
  async checkConfiguration(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
      }
    }

    // Check Google OAuth configuration
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      issues.push('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    }

    if (!process.env.GOOGLE_CLIENT_SECRET) {
      issues.push('Missing GOOGLE_CLIENT_SECRET');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  },

  async testGoogleServices(): Promise<{ available: boolean; services: Record<string, boolean> }> {
    const services = {
      accounts: false,
      apis: false,
      oauth: false
    };

    try {
      // Test Google Accounts
      await fetch('https://accounts.google.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      services.accounts = true;
    } catch (error) {
      console.warn('Google Accounts service test failed:', error);
    }

    try {
      // Test Google APIs
      await fetch('https://www.googleapis.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      services.apis = true;
    } catch (error) {
      console.warn('Google APIs service test failed:', error);
    }

    try {
      // Test OAuth endpoint
      await fetch('https://oauth2.googleapis.com/favicon.ico', { 
        method: 'HEAD', 
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      services.oauth = true;
    } catch (error) {
      console.warn('Google OAuth service test failed:', error);
    }

    return {
      available: Object.values(services).some(Boolean),
      services
    };
  }
};
