import { Html, Head, Main, NextScript } from 'next/document'
import { criticalCSS } from '../components/CriticalCSSInline'

export default function Document() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // CSP mais permissiva para desenvolvimento (permite unsafe-eval para React Refresh)
  const developmentCSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:5000 https://finnextho-backend.onrender.com https://api.stripe.com https://finnextho-5d86e.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://www.google-analytics.com; frame-src 'self' https://js.stripe.com https://accounts.google.com; object-src 'none'; base-uri 'self';"
  
  // CSP restritiva para produção (sem unsafe-eval)
  const productionCSP = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://finnextho-backend.onrender.com https://api.stripe.com https://finnextho-5d86e.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://www.google-analytics.com; frame-src 'self' https://js.stripe.com https://accounts.google.com; object-src 'none'; base-uri 'self';"

  return (
    <Html lang="pt-BR" className="light">
      <Head>
        <meta charSet="utf-8" />
        {/* Favicon e ícones */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon-simple.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* CSP condicional: permissiva em dev, restritiva em produção */}
        <meta httpEquiv="Content-Security-Policy" content={isDevelopment ? developmentCSP : productionCSP} />
        
        {/* Meta tags para SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="finnextho" />
        <meta name="publisher" content="finnextho" />
        
        {/* Preconnect para recursos críticos - otimizado para PageSpeed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://m.stripe.network" />
        
        {/* Google Font otimizado - inline critical font-face */}
        
        {/* Google Fonts - simplified approach for production */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Inline critical CSS for fastest LCP */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      </Head>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
32
1