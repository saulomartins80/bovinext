import { useEffect } from 'react'

// TypeScript interfaces for Layout Shift API
interface LayoutShiftEntry extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
  sources: LayoutShiftSource[]
}

interface LayoutShiftSource {
  node: Node
  previousRect: DOMRectReadOnly
  currentRect: DOMRectReadOnly
}

// Component to fix layout shifts and improve CLS
export default function LayoutShiftFixer() {
  useEffect(() => {
    // Fix font-related layout shifts
    const fixFontShifts = () => {
      // Add font-display: swap fallback for any missing fonts
      const style = document.createElement('style')
      style.textContent = `
        /* Prevent layout shift from font loading */
        * {
          font-display: swap;
        }
        
        /* Reserve space for web fonts */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        /* Prevent shifts from font weight changes */
        .font-bold, .font-semibold, .font-medium {
          font-synthesis: none;
        }
        
        /* Stabilize text rendering */
        .text-content {
          text-rendering: optimizeSpeed;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `
      document.head.appendChild(style)
    }

    // Fix image-related layout shifts
    const fixImageShifts = () => {
      const images = document.querySelectorAll('img:not([width]):not([height])')
      
      images.forEach(img => {
        if (img instanceof HTMLImageElement) {
          // Set aspect ratio to prevent shifts
          const computedStyle = window.getComputedStyle(img)
          const width = parseInt(computedStyle.width)
          const height = parseInt(computedStyle.height)
          
          if (width && height) {
            img.style.aspectRatio = `${width} / ${height}`
          } else {
            // Default aspect ratio for unknown images
            img.style.aspectRatio = '16 / 9'
          }
          
          // Add placeholder background
          img.style.backgroundColor = '#f3f4f6'
          
          // Ensure container has defined dimensions
          const parent = img.parentElement
          if (parent && !parent.style.height && !parent.style.minHeight) {
            parent.style.minHeight = '200px'
          }
        }
      })
    }

    // Fix dynamic content layout shifts
    const fixDynamicContentShifts = () => {
      // Reserve space for loading states
      const loadingElements = document.querySelectorAll('[data-loading="true"]')
      loadingElements.forEach(el => {
        if (el instanceof HTMLElement && !el.style.minHeight) {
          el.style.minHeight = '100px'
          el.style.backgroundColor = '#f9fafb'
        }
      })

      // Fix shifts from dynamic text content
      const dynamicText = document.querySelectorAll('[data-dynamic-text]')
      dynamicText.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.minHeight = '1.5em'
          el.style.lineHeight = '1.5'
        }
      })

      // Reserve space for buttons and interactive elements
      const buttons = document.querySelectorAll('button:not([style*="height"])')
      buttons.forEach(btn => {
        if (btn instanceof HTMLElement) {
          btn.style.minHeight = '40px'
        }
      })
    }

    // Fix shifts from CSS animations and transitions
    const fixAnimationShifts = () => {
      // Disable transforms that cause layout shifts
      const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="transition-"]')
      animatedElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Use transform instead of changing layout properties
          el.style.willChange = 'transform, opacity'
          
          // Prevent layout-affecting properties in animations
          const computedStyle = window.getComputedStyle(el)
          if (computedStyle.animation || computedStyle.transition) {
            el.style.contain = 'layout style paint'
          }
        }
      })
    }

    // Apply all fixes
    fixFontShifts()
    fixImageShifts()
    fixDynamicContentShifts()
    fixAnimationShifts()

    // Monitor for new layout shifts
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Type assertion for layout shift entry
          const layoutShiftEntry = entry as LayoutShiftEntry
          if (entry.entryType === 'layout-shift' && !layoutShiftEntry.hadRecentInput) {
            const clsValue = layoutShiftEntry.value
            if (clsValue > 0.1) {
              console.warn('Layout shift detected:', clsValue, entry)
              
              // Try to identify and fix the source
              const sources = layoutShiftEntry.sources || []
              sources.forEach((source: LayoutShiftSource) => {
                if (source.node instanceof HTMLElement) {
                  const element = source.node
                  
                  // Apply emergency fixes
                  if (element.tagName === 'IMG') {
                    element.style.aspectRatio = '16 / 9'
                    element.style.objectFit = 'cover'
                  }
                  
                  if (element.tagName === 'DIV' && !element.style.minHeight) {
                    element.style.minHeight = '50px'
                  }
                }
              })
            }
          }
        })
      })

      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch {
        console.warn('Layout shift observation not supported')
      }

      return () => observer.disconnect()
    }
  }, [])

  return null
}

// Hook for preventing specific layout shifts
export function useLayoutShiftPrevention() {
  useEffect(() => {
    // Prevent shifts during font loading
    const preventFontShifts = () => {
      document.fonts.ready.then(() => {
        // Font loaded, remove any temporary sizing
        const tempSized = document.querySelectorAll('[data-temp-sized]')
        tempSized.forEach(el => {
          if (el instanceof HTMLElement) {
            el.removeAttribute('data-temp-sized')
            el.style.minHeight = ''
          }
        })
      })
    }

    preventFontShifts()

    // Prevent shifts from lazy-loaded content
    const preventLazyLoadShifts = () => {
      const lazyElements = document.querySelectorAll('[loading="lazy"]')
      lazyElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Reserve space before loading
          if (!el.style.height && !el.style.minHeight) {
            el.style.minHeight = '200px'
            el.style.backgroundColor = '#f3f4f6'
            
            // Remove placeholder after load
            el.addEventListener('load', () => {
              el.style.minHeight = ''
              el.style.backgroundColor = ''
            }, { once: true })
          }
        }
      })
    }

    preventLazyLoadShifts()
  }, [])
}
