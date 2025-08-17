import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors/AppError';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Limpar registros expirados a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function rateLimitMiddleware(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || 'unknown'}_${req.path}`;
    const now = Date.now();
    
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    if (store[key].count >= maxRequests) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }
    
    store[key].count++;
    next();
  };
}

export default rateLimitMiddleware;
