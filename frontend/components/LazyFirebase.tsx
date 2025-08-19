import { useEffect, useState } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseInstance {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

declare global {
  interface Window {
    firebase?: FirebaseInstance;
  }
}

/**
 * Lazy loading mais agressivo para Firebase
 * Só carrega quando realmente necessário (interação do usuário)
 */
export const useLazyFirebase = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadFirebase = async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Carrega Firebase dinamicamente
      const { initializeApp } = await import('firebase/app');
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      
      // Verifica se Firebase já foi inicializado
      const { getApps } = await import('firebase/app');
      
      if (!window.firebase && getApps().length === 0) {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        window.firebase = { app, auth, db };
      } else if (getApps().length > 0 && !window.firebase) {
        // Usa app existente
        const app = getApps()[0];
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        window.firebase = { app, auth, db };
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Erro ao carregar Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoaded, isLoading, loadFirebase };
};

/**
 * Componente wrapper para carregar Firebase apenas quando necessário
 */
export const FirebaseLoader = ({ 
  children, 
  triggerOnMount = false 
}: { 
  children: React.ReactNode;
  triggerOnMount?: boolean;
}) => {
  const { loadFirebase } = useLazyFirebase();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (triggerOnMount) {
      loadFirebase();
      return;
    }

    const handleInteraction = () => {
      if (!hasInteracted) {
        loadFirebase();
        setHasInteracted(true);
      }
    };

    // Carrega Firebase na primeira interação
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { 
        once: true, 
        passive: true 
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [triggerOnMount, hasInteracted, loadFirebase]);

  return <>{children}</>;
};

/**
 * HOC para componentes que precisam do Firebase
 */
export const withLazyFirebase = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return function LazyFirebaseComponent(props: P) {
    return (
      <FirebaseLoader>
        <Component {...props} />
      </FirebaseLoader>
    );
  };
};

export default FirebaseLoader;
