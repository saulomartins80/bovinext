import { useEffect } from 'react'

// TypeScript interfaces for proper typing
interface ExtendedWindow extends Window {
  _?: Record<string, unknown>
  moment?: {
    locales(): string[]
    locale(locale: string, config: null): void
  }
}

// Component to reduce unused JavaScript and optimize bundle loading
export default function JavaScriptOptimizer() {
  useEffect(() => {
    // Remove unused JavaScript features
    const optimizeJS = () => {
      // Disable unused console methods in production
      if (process.env.NODE_ENV === 'production') {
        const noop = () => {}
        if (typeof window !== 'undefined') {
          window.console.debug = noop
          window.console.trace = noop
          window.console.group = noop
          window.console.groupEnd = noop
        }
      }

      // Remove unused polyfills
      const removeUnusedPolyfills = () => {
        // Remove intersection observer polyfill if native support exists
        if ('IntersectionObserver' in window) {
          const polyfillScript = document.querySelector('script[src*="intersection-observer"]')
          if (polyfillScript) {
            polyfillScript.remove()
          }
        }

        // Remove resize observer polyfill if native support exists
        if ('ResizeObserver' in window) {
          const polyfillScript = document.querySelector('script[src*="resize-observer"]')
          if (polyfillScript) {
            polyfillScript.remove()
          }
        }
      }

      removeUnusedPolyfills()

      // Optimize third-party scripts
      const optimizeThirdParty = () => {
        // Defer non-critical analytics
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"]')
        gaScripts.forEach(script => {
          if (script instanceof HTMLScriptElement) {
            script.defer = true
            script.async = true
          }
        })

        // Optimize Stripe loading
        const stripeScript = document.querySelector('script[src*="stripe"]')
        if (stripeScript instanceof HTMLScriptElement) {
          stripeScript.defer = true
        }
      }

      optimizeThirdParty()
    }

    // Run optimization after initial load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeJS)
    } else {
      optimizeJS()
    }

    // Tree shake unused modules
    const treeShakeModules = () => {
      // Mark unused modules for removal
      if (typeof window !== 'undefined') {
        const globalWindow = window as unknown as ExtendedWindow
        // Remove unused lodash methods if present
        if (globalWindow._ && typeof globalWindow._ === 'object') {
          const usedMethods = ['debounce', 'throttle', 'get', 'set', 'merge']
          Object.keys(globalWindow._).forEach((key: string) => {
            if (!usedMethods.includes(key) && globalWindow._) {
              delete globalWindow._[key]
            }
          })
        }

        // Remove unused moment.js locales if present
        if (globalWindow.moment?.locales) {
          const keepLocales = ['en', 'pt-br']
          const locales = globalWindow.moment.locales()
          if (Array.isArray(locales) && globalWindow.moment) {
            locales.forEach((locale: string) => {
              if (!keepLocales.includes(locale)) {
                globalWindow.moment?.locale(locale, null)
              }
            })
          }
        }
      }
    }

    treeShakeModules()

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeJS)
    }
  }, [])

  return null
}

// Hook for dynamic import optimization
export function useDynamicImports() {
  useEffect(() => {
    // Preload critical dynamic imports based on route
    const preloadCriticalImports = () => {
      const currentPath = window.location.pathname

      // Preload dashboard components if on dashboard route
      if (currentPath.includes('/dashboard')) {
        // Only preload if components exist
        Promise.all([
          import('../pages/dashboard').catch(() => null)
        ]).catch(() => {})
      }

      // Preload auth components if on auth route
      if (currentPath.includes('/login') || currentPath.includes('/register')) {
        // Auth pages will be preloaded when available
      }

      // Preload profile components if on profile route
      if (currentPath.includes('/profile')) {
        import('../pages/profile').catch(() => null)
      }
    }

    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(preloadCriticalImports, 1000)

    return () => clearTimeout(timer)
  }, [])
}

// Bundle analyzer helper
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis:')
    
    // Analyze loaded scripts
    const scripts = Array.from(document.scripts)
    const totalSize = scripts.reduce((total, script) => {
      if (script.src) {
        // Estimate size based on URL (rough approximation)
        const isVendor = script.src.includes('vendor') || script.src.includes('chunk')
        const estimatedSize = isVendor ? 200 : 50 // KB
        console.log(`Script: ${script.src.split('/').pop()} (~${estimatedSize}KB)`)
        return total + estimatedSize
      }
      return total
    }, 0)
    
    console.log(`Total estimated JS size: ${totalSize}KB`)
    
    if (totalSize > 500) {
      console.warn('Bundle size is large. Consider code splitting.')
    }
  }
}
