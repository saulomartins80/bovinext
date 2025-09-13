import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

export class AuthService {
  private supabaseAdmin = supabase;

  async login(email: string, password: string) {
    try {
      const { data, error } = await this.supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Usuário não encontrado');

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        user: data.user,
        session: data.session,
        profile
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async register(email: string, password: string, userData: any) {
    try {
      // 1. Criar usuário no Auth
      const { data, error } = await this.supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            fazenda: userData.fazenda_nome
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Falha ao criar usuário');

      // 2. Criar perfil na tabela users
      const userProfile = {
        id: data.user.id,
        email,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: profile, error: profileError } = await this.supabaseAdmin
        .from('users')
        .insert(userProfile)
        .select()
        .single();

      if (profileError) throw profileError;

      return {
        user: data.user,
        session: data.session,
        profile
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const { error } = await this.supabaseAdmin.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  async getSession() {
    try {
      const { data, error } = await this.supabaseAdmin.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      throw error;
    }
  }

  async getUser() {
    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
