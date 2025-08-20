import { useEffect } from 'react'

// Component to add dynamic resource hints for better performance
export default function ResourceHints() {
  useEffect(() => {
    // Add dynamic preconnect hints that might be missing
    const addResourceHint = (href: string, rel: string, crossOrigin?: boolean) => {
      const existing = document.querySelector(`link[href="${href}"][rel="${rel}"]`)
      if (!existing) {
        const link = document.createElement('link')
        link.rel = rel
        link.href = href
        if (crossOrigin) {
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      }
    }

    // Critical preconnects for Firebase
    addResourceHint('https://firebase.googleapis.com', 'preconnect')
    addResourceHint('https://firestore.googleapis.com', 'preconnect')
    addResourceHint('https://identitytoolkit.googleapis.com', 'preconnect')
    addResourceHint('https://securetoken.googleapis.com', 'preconnect')
    
    // Stripe preconnects
    addResourceHint('https://js.stripe.com', 'preconnect')
    addResourceHint('https://m.stripe.network', 'dns-prefetch')
    addResourceHint('https://q.stripe.com', 'dns-prefetch')
    
    // Google Analytics
    addResourceHint('https://www.google-analytics.com', 'preconnect')
    addResourceHint('https://analytics.google.com', 'preconnect')
    
    // Font optimization
    addResourceHint('https://fonts.googleapis.com', 'preconnect')
    addResourceHint('https://fonts.gstatic.com', 'preconnect', true)

    // Preload critical resources based on route
    const currentPath = window.location.pathname
    
    if (currentPath === '/' || currentPath === '/home') {
      // Preload hero images
      const heroImage = new Image()
      heroImage.src = '/images/hero-bg.webp'
      heroImage.loading = 'eager'
    }
    
    if (currentPath.includes('/dashboard')) {
      // Preload dashboard critical resources
      addResourceHint('https://api.finnextho.com', 'preconnect')
    }

  }, [])

  return null
}

// Hook for dynamic resource optimization
export function useResourceOptimization() {
  useEffect(() => {
    // Optimize resource loading based on user interaction
    let hasInteracted = false
    
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        hasInteracted = true
        
        // Load non-critical resources after first interaction
        const loadNonCritical = () => {
          // Preload Stripe if not already loaded
          if (!window.Stripe) {
            const stripeScript = document.createElement('script')
            stripeScript.src = 'https://js.stripe.com/v3/'
            stripeScript.async = true
            document.head.appendChild(stripeScript)
          }
          
          // Preload other non-critical resources
          const link = document.createElement('link')
          link.rel = 'prefetch'
          link.href = '/api/user/profile'
          document.head.appendChild(link)
        }
        
        // Delay to avoid blocking main thread
        setTimeout(loadNonCritical, 100)
      }
    }
    
    // Listen for first user interaction
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll']
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { 
        once: true, 
        passive: true 
      })
    })
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
  }, [])
}
