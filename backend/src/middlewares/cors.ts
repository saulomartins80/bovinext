// src/middlewares/cors.ts 
import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Lista de origens permitidas
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3001',
    'https://finnextho-frontend.onrender.com',
    'https://finnextho.com',
    'https://www.finnextho.com',
    'https://finnextho.vercel.app'
  ].filter(Boolean);

  const origin = req.headers.origin;
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log(`[CORS] Request from origin: ${origin}, User-Agent: ${userAgent}, Mobile: ${isMobile}`);
  
  // Verificar se a origem está na lista de permitidas
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`[CORS] Origin allowed: ${origin}`);
  } else if (!origin) {
    // Permitir requisições sem origin (mobile apps, SSE, etc.)
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`[CORS] No origin - allowing all (mobile/SSE support)`);
  } else {
    // Para mobile, ser mais permissivo
    if (isMobile) {
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`[CORS] Mobile device detected - allowing origin: ${origin}`);
    } else {
      // Bloquear origens não autorizadas apenas para desktop
      console.log(`[CORS] Desktop origin not authorized: ${origin}`);
      res.status(403).json({ error: 'Origem não autorizada' });
      return;
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Mobile-Request, X-User-Agent');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Headers de segurança adicionais (mais permissivos para mobile)
  res.header('X-Content-Type-Options', 'nosniff');
  if (!isMobile) {
    res.header('X-Frame-Options', 'DENY');
  }
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Headers específicos para mobile
  if (isMobile) {
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
  }
  
  if (req.method === 'OPTIONS') {
    console.log(`[CORS] OPTIONS preflight handled for ${origin || 'no-origin'}`);
    res.sendStatus(200);
    return;
  }
  
  next();
};