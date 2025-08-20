import { Stripe } from '@stripe/stripe-js';
import { useEffect, useState, useCallback } from 'react';

/**
 * Lazy loading do Stripe para melhorar performance inicial
 * Só carrega quando realmente necessário
 */
export const useOptimizedStripe = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStripe = useCallback(async () => {
    if (stripe || isLoading) return stripe;
    
    setIsLoading(true);
    try {
      const { loadStripe: stripeLoader } = await import('@stripe/stripe-js');
      const stripeInstance = await stripeLoader(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!);
      setStripe(stripeInstance);
      return stripeInstance;
    } catch (error) {
      console.error('Erro ao carregar Stripe:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [stripe, isLoading]);

  return { stripe, loadStripe, isLoading };
};

export const OptimizedStripe = ({ children }: { children: React.ReactNode }) => {
  const { loadStripe } = useOptimizedStripe();
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        loadStripe();
        setHasInteracted(true);
      }
    };

    // Carrega Stripe na primeira interação
    const events = ['mousedown', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [loadStripe, hasInteracted]);

  return <>{children}</>;
};

export default OptimizedStripe;
