// frontend/pages/_app.tsx - Mobile Performance Optimized
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import CriticalCSSInline from '../components/CriticalCSSInline'
// import { DynamicCSSLoader } from '../components/DynamicCSSLoader' // Unused for now
import OptimizedLCP from '../components/OptimizedLCP'
import ResourceHints from '../components/ResourceHints'
import CriticalImageOptimizer from '../components/CriticalImageOptimizer'
import JavaScriptOptimizer from '../components/JavaScriptOptimizer'
import LayoutShiftFixer from '../components/LayoutShiftFixer'
import { DashboardProvider } from '../context/DashboardContext'
import { NotificationProvider } from '../context/NotificationContext'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { ToastContainer } from 'react-toastify'
import { Suspense, lazy, useState, useEffect } from 'react'
import InteractionTracker, { useInteractionState } from '../components/InteractionTracker'
import { isProtectedRoute, isAuthPage } from '../utils/routes'

// Critical CSS only - other styles loaded on demand
import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/splide.css'
import 'react-tabs/style/react-tabs.css'

// Lazy load heavy components
const LazyGoogleAnalytics = lazy(() => import('../components/GoogleAnalytics'))
const LazyFirebaseLoader = lazy(() => import('../components/LazyFirebase'))
const LazyOptimizedStripe = lazy(() => import('../components/OptimizedStripe'))
const LazyI18n = lazy(() => import('../i18n').then(() => ({ default: () => null })))
const LazyAccessibilityFixes = lazy(() => import('../components/AccessibilityFixes'))
const LazyCSSPurger = lazy(() => import('../components/CSSPurger'))
const LazyFirebaseErrorHandler = lazy(() => import('../components/FirebaseErrorHandler'))
const LazyAuthInitializer = lazy(() => import('../components/AuthInitializer'))

// Import AuthProvider directly (not lazy) since it's needed for all routes
import { AuthProvider } from '../context/AuthContext'
import { FinanceProvider } from '../context/FinanceContext'

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
    <style jsx global>{`
      body { margin: 0; padding: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
      .hero-section { min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
      @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    `}</style>
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

function AppContent({ Component, pageProps, hasInteracted }: { Component: AppProps['Component']; pageProps: AppProps['pageProps']; hasInteracted: boolean }) {
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
        <LazyAuthInitializer>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LazyAuthInitializer>
      </Suspense>
    )
  }
  
  // Public routes with progressive enhancement
  return (
    <PublicLayout>
      <Component {...pageProps} />
      {/* Load i18n after interaction */}
      {hasInteracted && (
        <Suspense fallback={null}>
          <LazyI18n />
        </Suspense>
      )}
    </PublicLayout>
  )
}

function ProtectedAppContent({ Component, pageProps, hasInteracted }: AppProps & { hasInteracted: boolean }) {
  return (
        <FinanceProvider>
          <DashboardProvider>
            <NotificationProvider>
            <Suspense fallback={<LoadingFallback />}>
              <LazyOptimizedStripe>
                <AppContent Component={Component} pageProps={pageProps} hasInteracted={hasInteracted} />
              </LazyOptimizedStripe>
            </Suspense>
            </NotificationProvider>
          </DashboardProvider>
        </FinanceProvider>
  )
}

function ToastContainerWithTheme() {
  const { theme } = useTheme();
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={true}
      pauseOnHover={true}
      limit={5}
      style={{ zIndex: 9999 }}
      toastStyle={{ zIndex: 9999 }}
      theme={theme === 'dark' ? 'dark' : 'light'}
      closeButton={true}
      containerId="main-toast-container"
    />
  );
}

function MyApp(props: AppProps) {
  const router = useRouter()
  const { hasInteracted, markInteracted } = useInteractionState()
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
        <InteractionTracker onInteraction={markInteracted}>
          {/* Default document head to ensure every page has a title and viewport */}
          <Head>
            <title>Finnextho</title>
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
          {hasInteracted && (
            <Suspense fallback={null}>
              <LazyFirebaseLoader triggerOnMount={routeNeedsAuth}>
                <LazyFirebaseErrorHandler />
                <LazyAccessibilityFixes />
                <LazyCSSPurger />
                <LazyGoogleAnalytics />
              </LazyFirebaseLoader>
            </Suspense>
          )}
          
          {/* Main app content */}
          {!routeNeedsAuth ? (
            <AppContent {...props} hasInteracted={hasInteracted} />
          ) : (
            <ProtectedAppContent {...props} hasInteracted={hasInteracted} />
          )}
        </InteractionTracker>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp