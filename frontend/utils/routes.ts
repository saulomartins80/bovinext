/**
 * Centralized route configuration for the application
 * This file defines which routes are public, protected, or auth-related
 */

// Routes that require authentication (financial features and user dashboard)
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/transacoes',
  '/investimentos', 
  '/metas',
  '/milhas',
  '/configuracoes',
  '/profile',
  '/relatorios',
  '/assinaturas',
  '/sistema',
  '/payment',
  '/payment/sucesso'
];

// Authentication pages (login, register, etc.) - these get minimal layout
export const AUTH_PAGES = [
  '/auth/login', 
  '/auth/register', 
  '/auth/forgot-password', 
  '/auth/complete-registration'
];

// Public pages (everything else) - marketing, legal, company info, blog, community, etc.
// These are automatically determined as any route NOT in PROTECTED_ROUTES or AUTH_PAGES
export const SAMPLE_PUBLIC_ROUTES = [
  '/',
  '/recursos',
  '/solucoes', 
  '/precos',
  '/clientes',
  '/contato',
  '/sobre',
  '/termos',
  '/blog',
  '/comunidade',
  '/carreiras',
  '/imprensa',
  '/privacidade',
  '/cookies',
  '/seguranca',
  '/juridico',
  '/empresa',
  '/licencas',
  '/parceiros',
  '/suporte',
  '/demo',
  '/ebook',
  '/connect',
  '/test-toast',
  // Add any other public routes here
];

/**
 * Check if a route requires authentication
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.includes(pathname);
};

/**
 * Check if a route is an authentication page
 */
export const isAuthPage = (pathname: string): boolean => {
  return AUTH_PAGES.includes(pathname);
};

/**
 * Check if a route is public (doesn't require authentication)
 */
export const isPublicRoute = (pathname: string): boolean => {
  return !isProtectedRoute(pathname) && !isAuthPage(pathname);
};
