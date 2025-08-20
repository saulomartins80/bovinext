import { useEffect } from 'react'

// TypeScript interfaces for LCP API
interface LargestContentfulPaintEntry extends PerformanceEntry {
  renderTime: number
  loadTime: number
  size: number
  id: string
  url: string
  element: Element | null
}

// Component to optimize LCP by reducing element render delay
export default function OptimizedLCP() {
  useEffect(() => {
    // Optimize LCP element rendering
    const optimizeLCP = () => {
      // Remove any blocking operations on LCP element
      const lcpElement = document.querySelector('.hero-title, .hero-subtitle, [data-lcp]')
      if (lcpElement && lcpElement instanceof HTMLElement) {
        // Force immediate paint
        lcpElement.style.willChange = 'auto'
        lcpElement.style.transform = 'translateZ(0)'
        
        // Remove any opacity transitions that delay rendering
        const computedStyle = window.getComputedStyle(lcpElement)
        if (computedStyle.opacity === '0' || computedStyle.transform !== 'none') {
          lcpElement.style.opacity = '1'
          lcpElement.style.transform = 'none'
        }
      }

      // Optimize hero section specifically
      const heroSection = document.querySelector('.hero-section')
      if (heroSection && heroSection instanceof HTMLElement) {
        heroSection.style.contain = 'layout style paint'
        heroSection.style.willChange = 'auto'
      }

      // Preload critical images immediately
      const criticalImages = document.querySelectorAll('img[data-critical]')
      criticalImages.forEach(img => {
        if (img instanceof HTMLImageElement && !img.complete) {
          img.loading = 'eager'
          img.decoding = 'sync'
        }
      })

      // Remove any CSS animations on critical elements during initial load
      const animatedElements = document.querySelectorAll('[style*="opacity: 1; transform: none"]')
      animatedElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.transition = 'none'
          el.style.animation = 'none'
        }
      })
    }

    // Run immediately and after DOM is ready
    optimizeLCP()
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeLCP)
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeLCP)
    }
  }, [])

  return null
}

// Hook for LCP optimization
export function useLCPOptimization() {
  useEffect(() => {
    // Measure and optimize LCP
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpTime = entry.startTime
            
            // If LCP is too slow, apply emergency optimizations
            if (lcpTime > 2500) {
              // Remove all non-critical animations
              const style = document.createElement('style')
              style.textContent = `
                *, *::before, *::after {
                  animation-duration: 0.01ms !important;
                  animation-iteration-count: 1 !important;
                  transition-duration: 0.01ms !important;
                }
              `
              document.head.appendChild(style)
              
              // Force immediate visibility of LCP element
              const lcpEntry = entry as LargestContentfulPaintEntry
              const lcpElement = lcpEntry.element
              if (lcpElement && lcpElement instanceof HTMLElement) {
                lcpElement.style.opacity = '1'
                lcpElement.style.transform = 'none'
                lcpElement.style.visibility = 'visible'
              }
            }
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch {
        console.warn('LCP observation not supported')
      }

      return () => observer.disconnect()
    }
  }, [])
}
