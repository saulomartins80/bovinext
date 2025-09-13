// src/hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { Subscription } from '../../types/Subscription';

export const useSubscription = (userId: string | undefined) => {
  const [state, setState] = useState<{
    subscription: Subscription | null;
    loading: boolean;
    error: string | null;
  }>({ subscription: null, loading: false, error: null });

  useEffect(() => {
    // Assinaturas desativadas no BOVINEXT
    setState({ subscription: null, loading: false, error: null });
  }, [userId]);

  return state;
};