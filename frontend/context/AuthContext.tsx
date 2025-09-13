// context/AuthContext.tsx - BOVINEXT Mock Authentication
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// BOVINEXT User Types
export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  name: string; // Alias para compatibilidade
  uid: string; // Alias para compatibilidade
  telefone?: string;
  fazenda?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authChecked: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, fazenda?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearErrors: () => void;
  updateProfile: (updatedData: Partial<AuthUser>) => Promise<AuthUser>;
  setUser: (user: AuthUser | null) => void;
  isAuthReady: boolean;
  subscription?: any; // Para compatibilidade
  loadingSubscription?: boolean; // Para compatibilidade
  supabase: any; // Add supabase client to the interface
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authChecked: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearErrors: () => {},
  updateProfile: async () => {
    throw new Error('AuthProvider not initialized');
  },
  setUser: () => {},
  isAuthReady: false,
  subscription: null,
  loadingSubscription: false,
  supabase: {} as any, // Add empty supabase client to default context
});

// Helper functions for BOVINEXT Supabase auth
const normalizeUser = (supabaseUser: any, profile: any): AuthUser | null => {
  if (!supabaseUser) return null;
  
  // Usando os dados do perfil (profile) ou os metadados do usuário
  const displayName = profile?.display_name || supabaseUser.user_metadata?.name || '';
  const fazenda = profile?.fazenda_nome || supabaseUser.user_metadata?.fazenda || '';
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    nome: displayName,
    name: displayName, // Alias para compatibilidade
    uid: supabaseUser.id, // Alias para compatibilidade
    telefone: profile?.telefone || supabaseUser.user_metadata?.phone || '',
    fazenda: fazenda,
    avatar_url: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || '',
    created_at: profile?.created_at || supabaseUser.created_at || new Date().toISOString(),
    updated_at: profile?.updated_at || supabaseUser.updated_at || new Date().toISOString(),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  
  const [state, setState] = useState<{
    user: AuthUser | null;
    loading: boolean;
    authChecked: boolean;
    error: string | null;
    isAuthReady: boolean;
    subscription: any;
    loadingSubscription: boolean;
  }>({
    user: null,
    loading: true,
    authChecked: false,
    error: null,
    isAuthReady: false,
    subscription: null,
    loadingSubscription: false,
  });

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('[AuthContext] Perfil não encontrado ou tabela ausente:', error.message);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const profile = data.user ? await fetchUserProfile(data.user.id) : null;
      const user = normalizeUser(data.user, profile);

      setState(prev => ({
        ...prev,
        user,
        loading: false,
        authChecked: true,
        isAuthReady: true,
      }));

      router.push('/dashboard');
    } catch (error: any) {
      const message: string = error?.message || '';
      const isUnconfirmed = /email not confirmed/i.test(message) || (error?.name === 'AuthApiError' && /confirm/i.test(message));
      if (isUnconfirmed) {
        try {
          await supabase.auth.resend({ type: 'signup', email });
        } catch (resendError) {
          console.warn('Falha ao reenviar email de confirmação:', resendError);
        }
        setState(prev => ({
          ...prev,
          error: 'Email não confirmado. Reenviamos o link de confirmação. Verifique sua caixa de entrada e spam.',
          loading: false,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        error: message || 'Erro ao fazer login',
        loading: false,
      }));
      throw error;
    }
  }, [router, fetchUserProfile]);

  const register = useCallback(async (email: string, password: string, nome: string, fazenda?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 1. Criar usuário no Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            name: nome,
            fazenda_nome: fazenda || ''
          } 
        }
      });
      
      if (error) throw error;

      if (data.user) {
        // 2. Criar perfil na tabela 'users' somente se houver sessão (evita falha RLS quando email precisa confirmar)
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const hasSession = !!sessionData?.session;

          if (hasSession) {
            const userData = {
              id: data.user.id,
              email: data.user.email,
              name: nome,
              fazenda_nome: fazenda || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const { error: profileError } = await supabase
              .from('users')
              .insert(userData);

            if (profileError) {
              // Ignorar duplicidade/violação de unique, seguir fluxo
              const code = (profileError as any)?.code || '';
              const msg = (profileError as any)?.message || '';
              const isDuplicate = code === '23505' || /duplicate key|unique constraint/i.test(msg);
              if (!isDuplicate) {
                console.error('Erro ao criar perfil:', profileError);
                // Não interromper registro quando não houver sessão; deixar trigger do banco criar
                // Lançar apenas se for erro inesperado com sessão ativa
                throw new Error('Erro ao criar perfil do usuário');
              }
            }
          } else {
            // Sem sessão: Supabase pode exigir confirmação de email; trigger no banco deve criar o perfil
            console.warn('[AuthContext] Registro sem sessão ativa; pulando criação de perfil local (aguardando trigger)');
          }
        } catch (e) {
          // Não travar a UX do registro; logar e seguir
          console.warn('[AuthContext] Falha ao criar perfil imediatamente, seguindo com fluxo de registro:', e);
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: null,
      }));

      // Redirecionar para a página de login com mensagem de sucesso
      router.push('/auth/login?registration=success');
    } catch (error: any) {
      console.error('Erro no registro:', error);
      const errorMessage = error.message.includes('already registered') 
        ? 'Este email já está cadastrado' 
        : 'Erro ao criar conta. Tente novamente.';
        
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
        authChecked: true,
        isAuthReady: true,
      }));

      router.push('/auth/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Erro ao sair', 
        loading: false,
      }));
    }
  }, [router]);

  const updateProfile = useCallback(async (updatedData: Partial<AuthUser>) => {
    if (!state.user) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      // 1. Atualizar dados do usuário no Supabase Auth (se houver email para atualizar)
      if (updatedData.email && updatedData.email !== state.user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({
          email: updatedData.email,
          data: {
            name: updatedData.name || state.user.name,
            fazenda_nome: updatedData.fazenda || state.user.fazenda
          }
        });

        if (updateEmailError) throw updateEmailError;
      }

      // 2. Atualizar perfil na tabela 'users'
      const { error: updateProfileError } = await supabase
        .from('users')
        .update({
          name: updatedData.name || state.user.name,
          email: updatedData.email || state.user.email,
          fazenda_nome: updatedData.fazenda || state.user.fazenda,
          telefone: updatedData.telefone || state.user.telefone,
          avatar_url: updatedData.avatar_url || state.user.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (updateProfileError) throw updateProfileError;

      // 3. Atualizar estado local com os novos dados
      const updatedUser = {
        ...state.user,
        ...updatedData,
        updated_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        user: updatedUser,
        loading: false,
      }));

      return updatedUser;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Erro ao atualizar perfil',
        loading: false,
      }));
      throw error;
    }
  }, [state.user]);

  // Monitor auth state changes (Supabase)
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const supaUser = session?.user || null;
      if (supaUser) {
        const profile = await fetchUserProfile(supaUser.id);
        const user = normalizeUser(supaUser, profile);
        setState(prev => ({
          ...prev,
          user,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      } else {
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, [fetchUserProfile]);

  // Initialize auth state on mount to avoid spinner lock on protected pages
  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const supaUser = sessionData?.session?.user || null;
        if (supaUser) {
          const profile = await fetchUserProfile(supaUser.id);
          const user = normalizeUser(supaUser, profile);
          setState(prev => ({
            ...prev,
            user,
            loading: false,
            authChecked: true,
            isAuthReady: true,
          }));
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            loading: false,
            authChecked: true,
            isAuthReady: true,
          }));
        }
      } catch (e) {
        setState(prev => ({
          ...prev,
          loading: false,
          authChecked: true,
          isAuthReady: true,
        }));
      }
    })();
  }, [fetchUserProfile]);

  const value: AuthContextType = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    authChecked: state.authChecked,
    error: state.error,
    login,
    register,
    logout,
    clearErrors,
    updateProfile,
    setUser: (user: AuthUser | null) => {
      setState(prev => ({ ...prev, user }));
    },
    isAuthReady: state.isAuthReady,
    subscription: state.subscription,
    loadingSubscription: state.loadingSubscription,
    supabase, // Add supabase client to context
  }), [
    state,
    login,
    register,
    logout,
    clearErrors,
    updateProfile,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
