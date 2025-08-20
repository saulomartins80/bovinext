import { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'

// Lazy load heavy components
const LazyFirebase = lazy(() => import('./LazyFirebase'))
const LazyStripe = lazy(() => import('./OptimizedStripe'))
const LazyGoogleAnalytics = lazy(() => import('./GoogleAnalytics'))

// Critical components loaded immediately
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { isProtectedRoute, isAuthPage } from '../utils/routes'

interface MobileOptimizedAppProps extends AppProps {
  hasInteracted: boolean
}

// Lightweight loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

// Critical CSS inline for above-the-fold content
const CriticalStyles = () => (
  <style jsx global>{`
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-title {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      color: white;
      text-align: center;
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-size: clamp(1rem, 2.5vw, 1.5rem);
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
  `}</style>
)

export default function MobileOptimizedApp({ Component, pageProps, hasInteracted }: MobileOptimizedAppProps) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [shouldLoadHeavyComponents, setShouldLoadHeavyComponents] = useState(false)

  // Hydration check
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load heavy components only after interaction or for protected routes
  useEffect(() => {
    if (hasInteracted || isProtectedRoute(router.pathname)) {
      setShouldLoadHeavyComponents(true)
    }
  }, [hasInteracted, router.pathname])

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <>
        <CriticalStyles />
        <div className="hero-section">
          <div>
            <h1 className="hero-title">Finnextho</h1>
            <p className="hero-subtitle">Transforme suas finanças com IA</p>
          </div>
        </div>
      </>
    )
  }

  // Auth pages get minimal layout
  if (isAuthPage(router.pathname)) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    )
  }

  // Protected routes need full functionality
  if (isProtectedRoute(router.pathname)) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <LazyFirebase triggerOnMount={true}>
              <LazyStripe>
                <Component {...pageProps} />
              </LazyStripe>
            </LazyFirebase>
          </Suspense>
          {shouldLoadHeavyComponents && (
            <Suspense fallback={null}>
              <LazyGoogleAnalytics />
            </Suspense>
          )}
        </AuthProvider>
      </ThemeProvider>
    )
  }

  // Public pages with progressive enhancement
  return (
    <ThemeProvider>
      <AuthProvider>
        <CriticalStyles />
        <Component {...pageProps} />
        
        {/* Load heavy components only after interaction */}
        {shouldLoadHeavyComponents && (
          <Suspense fallback={null}>
            <LazyFirebase triggerOnMount={false}>
              <LazyGoogleAnalytics />
            </LazyFirebase>
          </Suspense>
        )}
      </AuthProvider>
    </ThemeProvider>
  )
}
