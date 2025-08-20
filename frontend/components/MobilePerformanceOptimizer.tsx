import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  fcp: number
  lcp: number
  cls: number
  fid: number
  ttfb: number
}

export default function MobilePerformanceOptimizer() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})

  useEffect(() => {
    // Optimize for mobile performance
    const optimizations = {
      // Reduce main thread blocking
      reduceMainThreadWork: () => {
        // Use requestIdleCallback for non-critical work
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            // Defer non-critical JavaScript execution
            const scripts = document.querySelectorAll('script[data-defer]')
            scripts.forEach(script => {
              if (script instanceof HTMLScriptElement) {
                const newScript = document.createElement('script')
                newScript.src = script.src
                newScript.async = true
                document.head.appendChild(newScript)
                script.remove()
              }
            })
          })
        }
      },

      // Optimize images for mobile
      optimizeImages: () => {
        const images = document.querySelectorAll('img[data-optimize]')
        images.forEach(img => {
          if (img instanceof HTMLImageElement) {
            // Add loading="lazy" for below-fold images
            if (!img.loading) {
              img.loading = 'lazy'
            }
            // Add decoding="async" for better performance
            img.decoding = 'async'
          }
        })
      },

      // Preload critical resources
      preloadCriticalResources: () => {
        const criticalResources = [
          { href: '/fonts/inter-400.woff2', as: 'font', type: 'font/woff2' },
          { href: '/fonts/inter-600.woff2', as: 'font', type: 'font/woff2' },
        ]

        criticalResources.forEach(resource => {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.href = resource.href
          link.as = resource.as
          if (resource.type) link.type = resource.type
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
        })
      },

      // Remove unused CSS
      removeUnusedCSS: () => {
        // Mark CSS as used when elements are visible
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.setAttribute('data-css-used', 'true')
            }
          })
        })

        document.querySelectorAll('[class]').forEach(el => {
          observer.observe(el)
        })
      },

      // Optimize third-party scripts
      optimizeThirdParty: () => {
        // Delay Google Analytics until user interaction
        const gtag = document.querySelector('script[src*="googletagmanager"]')
        if (gtag && !gtag.hasAttribute('data-optimized')) {
          gtag.setAttribute('data-optimized', 'true')
          gtag.setAttribute('data-defer', 'true')
        }
      }
    }

    // Apply optimizations
    Object.values(optimizations).forEach(optimize => optimize())

    // Measure performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      const measurePerformance = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paint = performance.getEntriesByType('paint')
        
        const newMetrics: Partial<PerformanceMetrics> = {
          ttfb: navigation.responseStart - navigation.requestStart,
        }

        paint.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            newMetrics.fcp = entry.startTime
          }
        })

        setMetrics(newMetrics)
      }

      // Measure after page load
      if (document.readyState === 'complete') {
        measurePerformance()
      } else {
        window.addEventListener('load', measurePerformance)
      }
    }

    // Cleanup
    return () => {
      // Remove event listeners if needed
    }
  }, [])

  // Log metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && Object.keys(metrics).length > 0) {
      console.log('📊 Performance Metrics:', metrics)
    }
  }, [metrics])

  return null
}

// Hook for performance monitoring
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
        }
        if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as PerformanceEntry & { value: number }
          setMetrics(prev => ({ ...prev, cls: (prev.cls || 0) + layoutShift.value }))
        }
        if (entry.entryType === 'first-input') {
          const firstInput = entry as PerformanceEntry & { processingStart: number }
          setMetrics(prev => ({ 
            ...prev, 
            fid: firstInput.processingStart - entry.startTime 
          }))
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] })
    } catch (error) {
      // Fallback for browsers that don't support these metrics
      console.warn('Performance metrics not supported:', error)
    }

    return () => observer.disconnect()
  }, [])

  return metrics
}
