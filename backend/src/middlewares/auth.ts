import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../types/auth';

/**
 * Middleware para autenticação via JWT do Supabase
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'Token de autenticação não fornecido' 
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verificar o token JWT usando o Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Token inválido ou expirado');
    }
    
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    
    // Adicionar usuário ao objeto de requisição
    req.user = {
      _id: user.id,
      id: user.id,
      uid: user.id,
      firebaseUid: user.id,
      email: user.email || '',
      // mapear campos relevantes do perfil explicitamente
      fazenda_nome: (profile as any)?.fazenda_nome,
      display_name: (profile as any)?.display_name,
      subscription_plan: (profile as any)?.subscription_plan,
      subscription_status: (profile as any)?.subscription_status
    } as any;

    next();
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ 
      success: false,
      message: 'Falha na autenticação',
      error: error.message 
    });
  }
};

/**
 * Middleware para verificar se o usuário tem um perfil completo
 */
export const checkProfileComplete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false,
        message: 'Usuário não autenticado' 
      });
      return;
    }

    // Verificar se o perfil está completo
    if (!(req.user as any).fazenda_nome) {
      res.status(403).json({ 
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Seu perfil precisa ser completado antes de continuar' 
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Erro ao verificar perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao verificar perfil do usuário',
      error: error.message 
    });
  }
};