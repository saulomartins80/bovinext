import { Request, Response } from 'express';
import { authService } from '../services/AuthService';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const { user, session, profile } = await authService.login(email, password);
      
      // Se o email ainda não foi verificado
      if (!user.email_confirmed_at) {
        return res.status(403).json({
          success: false,
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Por favor, verifique seu email antes de fazer login',
          user: {
            id: user.id,
            email: user.email
          }
        });
      }

      // Criar objeto de usuário com tipos explícitos
      const userResponse = {
        id: user.id,
        email: user.email,
        ...(profile || {})
      };
      
      res.json({
        success: true,
        user: userResponse,
        access_token: session?.access_token,
        refresh_token: session?.refresh_token
      });
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      if (error.message === 'Invalid login credentials') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, ...userData } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const { user, session, profile } = await authService.register(email, password, userData);
      
      // Criar objeto de usuário com tipos explícitos
      const userResponse = {
        id: user.id,
        email: user.email,
        ...(profile || {})
      };
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso. Verifique seu email para ativar sua conta.',
        user: userResponse,
        access_token: session?.access_token,
        refresh_token: session?.refresh_token
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      await authService.logout();
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error.message
      });
    }
  }

  async getSession(req: Request, res: Response) {
    try {
      const session = await authService.getSession();
      
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Não autenticado'
        });
      }
      
      const user = await authService.getUser();
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Importar o cliente Supabase
      const { supabase } = require('../../config/supabase');
      
      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          ...profile
        }
      });
    } catch (error: any) {
      console.error('Erro ao verificar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar sessão',
        error: error.message
      });
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }
      
      // Importar o cliente Supabase
      const { supabase } = require('../../config/supabase');
      
      // Isso envia um email de confirmação para o usuário
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm-email`
        }
      });
      
      if (error) throw error;
      
      res.json({
        success: true,
        message: 'Email de verificação reenviado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email de verificação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao reenviar email de verificação',
        error: error.message
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email é obrigatório' });
      }

      const { supabase } = require('../../config/supabase');
      const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (error) throw error;

      res.json({ success: true, message: 'Enviamos um email para redefinir sua senha.' });
    } catch (error: any) {
      console.error('Erro ao solicitar reset de senha:', error);
      res.status(500).json({ success: false, message: 'Erro ao solicitar reset de senha', error: error.message });
    }
  }

  async adminResetPassword(req: Request, res: Response) {
    try {
      const { userId, newPassword } = req.body;
      if (!userId || !newPassword) {
        return res.status(400).json({ success: false, message: 'userId e newPassword são obrigatórios' });
      }

      const { supabase } = require('../../config/supabase');
      const { data, error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      if (error) throw error;

      res.json({ success: true, message: 'Senha atualizada com sucesso', userId: data.user.id });
    } catch (error: any) {
      console.error('Erro no adminResetPassword:', error);
      res.status(500).json({ success: false, message: 'Erro ao atualizar senha', error: error.message });
    }
  }
}

export const authController = new AuthController();
