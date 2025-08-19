import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para forçar redirecionamento HTTPS em produção
 * Funciona com Render.com e outros provedores que usam proxy reverso
 */
export const httpsRedirect = (req: Request, res: Response, next: NextFunction): void => {
  // Só aplicar em produção
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Verificar se a requisição já é HTTPS
  const isHttps = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  (req.socket && (req.socket as any).encrypted);

  if (!isHttps) {
    // Redirecionar para HTTPS com status 301 (permanente)
    const httpsUrl = `https://${req.get('host')}${req.originalUrl}`;
    console.log(`[HTTPS] Redirecting ${req.originalUrl} to ${httpsUrl}`);
    return res.redirect(301, httpsUrl);
  }

  // Adicionar headers de segurança HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Forwarded-Proto', 'https');
  
  next();
};

/**
 * Middleware para adicionar headers de segurança relacionados ao HTTPS
 */
export const httpsSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    // HSTS - HTTP Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Upgrade Insecure Requests
    res.setHeader('Content-Security-Policy', 'upgrade-insecure-requests');
    
    // Referrer Policy para HTTPS
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
};
