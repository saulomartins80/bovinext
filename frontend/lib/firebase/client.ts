// frontend/lib/firebase/client.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  type UserCredential,
  type Auth,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
  browserSessionPersistence,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { GoogleAuthEnhanced, GoogleAuthErrorHandler, GoogleAuthDiagnostics } from './googleAuthEnhanced';
import { GoogleAuthValidator, validateGoogleAuthQuick } from './googleAuthValidator';

// ✅ ENHANCED: Configuração do Firebase com validação robusta
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // ✅ ENHANCED: Usar validador robusto
  const validation = GoogleAuthValidator.validateConfiguration();
  
  if (!validation.isValid) {
    console.error('❌ Firebase configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error(`Firebase configuration incomplete: ${validation.errors.join(', ')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Firebase configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`🔒 Firebase Security Score: ${validation.securityScore}/100`);
  
  // Domain validation
  const domainValidation = GoogleAuthValidator.validateDomainConfiguration();
  if (!domainValidation.isValid) {
    console.warn('⚠️ Domain configuration issues:');
    domainValidation.issues.forEach(issue => console.warn(`  - ${issue}`));
  }

  console.log('✅ Firebase configuration validated successfully');
  return config;
};

const firebaseConfig = getFirebaseConfig();

let app: FirebaseApp;
let auth: Auth;
let db: ReturnType<typeof getFirestore>;
let storage: FirebaseStorage | null = null;

const initializeFirebase = () => {
  try {
    if (!getApps().length) {
      console.log('Initializing Firebase app...');
      
      // Test Firebase connectivity before initializing
      const testConnectivity = async () => {
        try {
          // Simple connectivity test to Firebase
          await fetch(`https://${firebaseConfig.authDomain}`, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          console.log('✅ Firebase connectivity test passed');
        } catch (error) {
          console.warn('⚠️ Firebase connectivity test failed:', error);
        }
      };
      
      // Run connectivity test in background
      testConnectivity();
      
      app = initializeApp(firebaseConfig);
      
      console.log('Initializing Firebase auth...');
      
      // Detectar mobile para configurações específicas
      const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const authConfig = {
        persistence: browserSessionPersistence,
        ...(isMobile && {
          // Configurações específicas para mobile
          popupRedirectResolver: browserPopupRedirectResolver
        })
      };
      
      auth = initializeAuth(app, authConfig);
      console.log('✅ Firebase Auth initialized with mobile support:', { isMobile });
      
      console.log('Initializing Firestore...');
      db = getFirestore(app);
      
      // ✅ CORREÇÃO: Inicializar Firebase Storage
      console.log('Initializing Firebase Storage...');
      try {
        storage = getStorage(app);
        console.log('✅ Firebase Storage initialized successfully');
      } catch (error) {
        console.error('❌ Firebase Storage initialization failed:', error);
        storage = null;
      }
      
      console.log('Firebase initialized successfully');
    } else {
      console.log('Using existing Firebase app...');
      app = getApps()[0];
      auth = getAuth(app);
      db = getFirestore(app);
      // ✅ CORREÇÃO: Inicializar Storage também no reuso da app
      try {
        storage = getStorage(app);
        console.log('✅ Firebase Storage reused successfully');
      } catch (error) {
        console.error('❌ Firebase Storage reuse failed:', error);
        storage = null;
      }
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

// ✅ CORREÇÃO: Inicializar Firebase apenas no lado do cliente com detecção de mobile e diagnóstico
if (typeof window !== 'undefined') {
  try {
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('🔍 Device detection:', { isMobile, userAgent: navigator.userAgent });
    
    // Import and run diagnostics
    import('./connectionTest').then(async ({ diagnoseFirebaseIssues, testFirebaseConnectivity }) => {
      const issues = await diagnoseFirebaseIssues();
      if (issues.length > 0) {
        console.error('🔥 Firebase configuration issues detected:', issues);
      }
      
      const connectivity = await testFirebaseConnectivity();
      console.log('🔍 Firebase connectivity test:', connectivity);
      
      if (!connectivity.success) {
        console.error('🔥 Firebase connectivity failed. This may cause authentication issues.');
      }
    }).catch(err => {
      console.warn('⚠️ Could not run Firebase diagnostics:', err);
    });
    
    initializeFirebase();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}


export const loginWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    console.error('Firebase Auth not initialized');
    throw new Error('Firebase Auth não foi inicializado. Verifique a configuração.');
  }

  try {
    // Use the enhanced Google Auth class
    const googleAuth = new GoogleAuthEnhanced(auth);
    
    // Run diagnostics before attempting login
    const configCheck = await GoogleAuthDiagnostics.checkConfiguration();
    if (!configCheck.valid) {
      console.error('❌ Google Auth configuration issues:', configCheck.issues);
      throw new Error('Configuração do Google Auth incompleta: ' + configCheck.issues.join(', '));
    }
    
    const servicesCheck = await GoogleAuthDiagnostics.testGoogleServices();
    if (!servicesCheck.available) {
      console.warn('⚠️ Google services may not be fully available:', servicesCheck.services);
    }
    
    console.log('🚀 Starting enhanced Google sign-in...');
    console.log('📊 Device info:', googleAuth.getProviderInfo());
    
    const result = await googleAuth.signIn();
    console.log('✅ Google sign-in successful');
    return result;
    
  } catch (error: unknown) {
    console.error('❌ Google sign-in error:', error);
    
    const firebaseError = error as { code?: string; message?: string };
    
    // Special handling for redirect case
    if (firebaseError.message === 'REDIRECTING_FOR_GOOGLE_SIGNIN') {
      throw error;
    }
    
    // Use enhanced error handler
    const userFriendlyMessage = GoogleAuthErrorHandler.getErrorMessage(firebaseError);
    throw new Error(userFriendlyMessage);
  }
};

export const loginWithEmailAndPassword = (email: string, password: string) => {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return firebaseSignInWithEmailAndPassword(auth, email, password);
};

// ✅ CORREÇÃO: Função para obter instâncias do Firebase com verificação
export const getFirebaseInstances = () => {
  if (!app || !auth) {
    console.log('Firebase instances not found, initializing...');
    initializeFirebase();
  }
  return { app, auth, db, storage };
};

// ✅ NOVA: Função para obter Storage com verificação de disponibilidade
export const getFirebaseStorage = (): FirebaseStorage | null => {
  if (!storage) {
    console.warn('⚠️ Firebase Storage not available. Storage features will be disabled.');
    return null;
  }
  return storage;
};

// ✅ NOVA: Verificar se Storage está disponível
export const isStorageAvailable = (): boolean => {
  return storage !== null;
};

// ✅ NOVA: Função para processar resultado de redirect do Google
export const handleGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  if (!auth) {
    console.warn('Firebase Auth not initialized for redirect result');
    return null;
  }
  
  try {
    const googleAuth = new GoogleAuthEnhanced(auth);
    return await googleAuth.handleRedirectResult();
  } catch (error) {
    console.error('Error handling Google redirect result:', error);
    throw error;
  }
};

// ✅ NOVA: Função para diagnóstico completo do Google Auth
export const diagnoseGoogleAuth = async (): Promise<{
  configuration: { valid: boolean; issues: string[] };
  services: { available: boolean; services: Record<string, boolean> };
  recommendations: string[];
}> => {
  const configuration = await GoogleAuthDiagnostics.checkConfiguration();
  const services = await GoogleAuthDiagnostics.testGoogleServices();
  
  const recommendations: string[] = [];
  
  if (!configuration.valid) {
    recommendations.push('Verifique as variáveis de ambiente do Firebase e Google OAuth');
  }
  
  if (!services.available) {
    recommendations.push('Verifique a conectividade com os serviços do Google');
  }
  
  if (!services.services.accounts) {
    recommendations.push('Google Accounts pode estar bloqueado ou indisponível');
  }
  
  if (!services.services.oauth) {
    recommendations.push('Google OAuth pode estar bloqueado ou indisponível');
  }
  
  return {
    configuration,
    services,
    recommendations
  };
};

export {
  app,
  auth,
  db,
  storage,
  firebaseSignOut as signOut,
  onAuthStateChanged,
  getIdToken,
  GoogleAuthEnhanced,
  GoogleAuthErrorHandler,
  GoogleAuthDiagnostics,
  GoogleAuthValidator,
  validateGoogleAuthQuick
}; 