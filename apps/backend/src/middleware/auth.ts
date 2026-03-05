import { Request, Response, NextFunction } from 'express';
import { supabaseAuth } from '../config/supabase';
import { AppError } from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export const authMiddleware = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(new AppError('Token ausente', 401));
  }

  const [, token] = authHeader.split(' ');
  if (!token) {
    return next(new AppError('Token inválido', 401));
  }

  try {
    // Validar token diretamente com o Supabase (online approach)
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return next(new AppError('Sessão expirada ou token inválido', 401));
    }

    req.userId = user.id;
    req.userEmail = user.email;
    req.userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';

    next();
  } catch (_error) {
    return next(new AppError('Falha na autenticação do provedor', 401));
  }
};
