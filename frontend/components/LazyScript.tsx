import { useEffect, useState } from 'react';
import Script from 'next/script';

interface LazyScriptProps {
  src: string;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  onLoad?: () => void;
  onError?: () => void;
  triggerOnInteraction?: boolean;
  children?: React.ReactNode;
}

/**
 * Componente para carregamento lazy de scripts
 * Melhora performance inicial carregando scripts apenas quando necessário
 */
export const LazyScript = ({
  src,
  strategy = 'lazyOnload',
  onLoad,
  onError,
  triggerOnInteraction = false,
  children
}: LazyScriptProps) => {
  const [shouldLoad, setShouldLoad] = useState(!triggerOnInteraction);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (triggerOnInteraction && !hasInteracted) {
      const handleInteraction = () => {
        setShouldLoad(true);
        setHasInteracted(true);
        
        // Remove listeners após primeira interação
        document.removeEventListener('mouseenter', handleInteraction);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };

      // Adiciona listeners para diferentes tipos de interação
      document.addEventListener('mouseenter', handleInteraction, { passive: true });
      document.addEventListener('click', handleInteraction, { passive: true });
      document.addEventListener('scroll', handleInteraction, { passive: true });
      document.addEventListener('touchstart', handleInteraction, { passive: true });

      return () => {
        document.removeEventListener('mouseenter', handleInteraction);
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
      };
    }
  }, [triggerOnInteraction, hasInteracted]);

  if (!shouldLoad) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={src}
        strategy={strategy}
        onLoad={onLoad}
        onError={onError}
      />
      {children}
    </>
  );
};

/**
 * Hook para carregamento lazy de scripts
 */
export const useLazyScript = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadScript = () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError(new Error(`Failed to load script: ${src}`));
      setIsLoading(false);
    };

    document.head.appendChild(script);
  };

  return { isLoaded, isLoading, error, loadScript };
};

export default LazyScript;
