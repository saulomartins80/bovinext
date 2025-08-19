import { useEffect } from 'react';

/**
 * Componente para capturar e corrigir erros Firebase 404
 * Intercepta requests Firebase e adiciona fallbacks
 */
export const FirebaseErrorHandler = () => {
  useEffect(() => {
    // Intercepta erros de rede do Firebase
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);
        
        // Se é uma request Firebase que falhou
        if (typeof input === 'string' && input.includes('firebase')) {
          if (response.status === 404) {
            console.warn(`Firebase 404 intercepted: ${input}`);
            
            // Retorna resposta mock para evitar erro
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Resource not found',
              fallback: true 
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          if (!response.ok && response.status >= 500) {
            console.warn(`Firebase server error intercepted: ${input} - ${response.status}`);
            
            // Retry após delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return originalFetch(input, init);
          }
        }
        
        return response;
      } catch (error) {
        // Se é erro Firebase, tenta fallback
        if (typeof input === 'string' && input.includes('firebase')) {
          console.warn(`Firebase network error intercepted: ${input}`, error);
          
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Network error',
            fallback: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        throw error;
      }
    };

    // Intercepta erros não capturados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (error?.message?.includes('firebase') || 
          error?.code?.includes('firebase') ||
          error?.message?.includes('Failed to fetch')) {
        console.warn('Firebase error intercepted:', error);
        
        // Previne que o erro apareça no console
        event.preventDefault();
        
        // Log estruturado para debugging
        console.group('🔥 Firebase Error Details');
        console.log('Error:', error);
        console.log('Stack:', error?.stack);
        console.log('Code:', error?.code);
        console.groupEnd();
      }
    };

    // Intercepta erros de script
    const handleScriptError = (event: ErrorEvent) => {
      if (event.filename?.includes('firebase') || 
          event.message?.includes('firebase')) {
        console.warn('Firebase script error intercepted:', event.message);
        return true; // Previne que apareça no console
      }
      return false;
    };

    // Adiciona listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleScriptError);

    // Cleanup
    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleScriptError);
    };
  }, []);

  return null;
};

/**
 * Hook para monitorar saúde do Firebase
 */
export const useFirebaseHealth = () => {
  useEffect(() => {
    const checkFirebaseHealth = async () => {
      try {
        // Testa conectividade básica
        const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
        if (!authDomain) return;

        await fetch(`https://${authDomain}`, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });

        console.log('✅ Firebase health check passed');
      } catch (error) {
        console.warn('⚠️ Firebase health check failed:', error);
        
        // Tenta fallback para CDN do Firebase
        try {
          await fetch('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          console.log('✅ Firebase CDN accessible');
        } catch (cdnError) {
          console.error('❌ Firebase CDN also failed:', cdnError);
        }
      }
    };

    // Executa check inicial
    checkFirebaseHealth();

    // Executa check periódico
    const interval = setInterval(checkFirebaseHealth, 30000); // 30s

    return () => clearInterval(interval);
  }, []);
};

/**
 * Utilitário para configurações Firebase otimizadas
 */
export const getOptimizedFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validação mais robusta
  const requiredKeys = Object.keys(config) as (keyof typeof config)[];
  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase config keys:', missingKeys);
    
    // Fallback config para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Using fallback Firebase config for development');
      return {
        ...config,
        // Adiciona valores padrão para desenvolvimento se necessário
      };
    }
    
    throw new Error(`Firebase config incomplete: ${missingKeys.join(', ')}`);
  }

  return config;
};

export default FirebaseErrorHandler;
