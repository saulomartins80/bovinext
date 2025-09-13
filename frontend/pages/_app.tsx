// frontend/pages/_app.tsx - Mobile Performance Optimized
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ThemeProvider } from '../context/ThemeContext';
import CriticalCSSInline from '../components/CriticalCSSInline'
// import { DynamicCSSLoader } from '../components/DynamicCSSLoader' // Unused for now
import OptimizedLCP from '../components/OptimizedLCP'
import ResourceHints from '../components/ResourceHints'
import CriticalImageOptimizer from '../components/CriticalImageOptimizer'
import JavaScriptOptimizer from '../components/JavaScriptOptimizer'
import LayoutShiftFixer from '../components/LayoutShiftFixer'
import { NotificationProvider } from '../context/NotificationContext'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
// import { ToastContainer } from 'react-toastify' // Removido temporariamente
import { Suspense, lazy, useState, useEffect } from 'react'
import InteractionTracker from '../components/InteractionTracker'
import { isProtectedRoute, isAuthPage } from '../utils/routes'

// Critical CSS only - other styles loaded on demand
import '../styles/globals.css'
import '../styles/compatibility.css'
// import 'react-toastify/dist/ReactToastify.css' // Removido temporariamente
import '../styles/splide.css'
import 'react-tabs/style/react-tabs.css'

// Simplified lazy loading for BOVINEXT
const LazyI18n = lazy(() => Promise.resolve({ default: () => null }))
const LazyAccessibilityFixes = lazy(() => Promise.resolve({ default: () => null }))
const LazyCSSPurger = lazy(() => Promise.resolve({ default: () => null }))

// Import providers for BOVINEXT
import { AuthProvider } from '../context/AuthContext'
import { BovinextProvider } from '../context/BovinextContext'

// Loading fallback component - Named for Fast Refresh
function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

// Critical styles for above-the-fold content - Named for Fast Refresh
function CriticalInlineStyles() {
  return (
    <style jsx global>
      {`
        html {
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        }
        body { margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
        .hero-section { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}
    </style>
  )
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CriticalInlineStyles />
      <div className="public-layout min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
      </div>
    </>
  )
}

function AppContent({ Component, pageProps }: { Component: AppProps['Component']; pageProps: AppProps['pageProps'] }) {
  const router = useRouter()
  
  // Auth pages get minimal layout
  if (isAuthPage(router.pathname)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...pageProps} />
      </Suspense>
    )
  }
  
  // Protected routes need full functionality but loaded progressively
  if (isProtectedRoute(router.pathname)) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Suspense>
    )
  }
  
  // Public routes with progressive enhancement
  return (
    <PublicLayout>
      <Component {...pageProps} />
      {/* Load i18n after interaction */}
      <Suspense fallback={null}>
        <LazyI18n />
      </Suspense>
    </PublicLayout>
  )
}

function ProtectedAppContent({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

function ToastContainerWithTheme() {
  return (
    <div style={{ zIndex: 9999 }} />
  )
}

function MyApp(props: AppProps) {
  const router = useRouter()
  const [, setHasInteracted] = useState(false);
  const [isClient, setIsClient] = useState(false)
  
  // Hydration check - optimized for Fast Refresh
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const routeNeedsAuth = isProtectedRoute(router.pathname)
  
  // Simplified SSR to prevent Fast Refresh conflicts
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <BovinextProvider>
          <NotificationProvider>
            <InteractionTracker onInteraction={() => setHasInteracted(true)}>
          {/* Default document head to ensure every page has a title and viewport */}
          <Head>
            <title>BOVINEXT</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#3b82f6" />
          </Head>
          {/* Critical CSS inline para LCP otimizado */}
          <CriticalCSSInline />
          
          {/* Otimizações de performance críticas */}
          <OptimizedLCP />
          <ResourceHints />
          <CriticalImageOptimizer />
          <JavaScriptOptimizer />
          <LayoutShiftFixer />
          <ToastContainerWithTheme />
          
          {/* Progressive enhancement based on interaction and route type */}
          <Suspense fallback={null}>
            <Suspense fallback={<LoadingFallback />}>
              <LazyI18n />
            </Suspense>
          </Suspense>
          <LazyCSSPurger />
          
          {/* Main app content */}
          {!routeNeedsAuth ? (
            <AppContent {...props} />
          ) : (
            <ProtectedAppContent {...props} />
          )}
            </InteractionTracker>
          </NotificationProvider>
        </BovinextProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp