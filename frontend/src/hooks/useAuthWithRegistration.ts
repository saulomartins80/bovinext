import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import type { AuthUser } from '../../context/AuthContext';

export const useAuthWithRegistration = () => {
  const { user: ctxUser } = useAuth();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Adaptado para Supabase/AuthContext: considerar cadastro completo após login
    setUser(ctxUser);
    setRegistrationComplete(ctxUser ? true : null);
    setLoading(false);
  }, [ctxUser]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Google login não implementado no fluxo atual
      throw new Error('Firebase disabled - use Supabase authentication');
    } catch (error) {
      console.error('Erro no login com Google:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Usar useAuth().logout() nas páginas diretamente
      throw new Error('Firebase disabled - use Supabase authentication');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return {
    user,
    loading,
    registrationComplete,
    handleGoogleLogin,
    logout
  };
};
 