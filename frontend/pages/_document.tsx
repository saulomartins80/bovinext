import { Html, Head, Main, NextScript } from 'next/document'
import { criticalCSS } from '../components/CriticalCSSInline'

export default function Document() {
  return (
    <Html lang="pt-BR" className="light">
      <Head>
        <meta charSet="utf-8" />
        {/* Favicon e ícones */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon-simple.svg" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* CSP otimizada para produção */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://fonts.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://finnextho-backend.onrender.com https://api.stripe.com; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self';" />
        
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