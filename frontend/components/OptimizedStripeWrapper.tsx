import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import type { Stripe } from '@stripe/stripe-js'

// Lazy load Stripe components
const LazyElements = lazy(() => import('@stripe/react-stripe-js').then(mod => ({ default: mod.Elements })))

interface OptimizedStripeProps {
  children: (props: { stripe: Stripe | null; isLoading: boolean }) => React.ReactNode
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="spinner"></div>
  </div>
)

export default function OptimizedStripeWrapper({ children }: OptimizedStripeProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)

  // Load Stripe only when needed (user interaction or protected route)
  const loadStripe = useCallback(async () => {
    if (isLoading || stripe) return

    setIsLoading(true)
    try {
      const { loadStripe: loadStripeJS } = await import('@stripe/stripe-js')
      const stripeInstance = await loadStripeJS(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      setStripe(stripeInstance)
    } catch (error) {
      console.error('Failed to load Stripe:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, stripe])

  useEffect(() => {
    if (shouldLoad) {
      loadStripe()
    }
  }, [shouldLoad, loadStripe])

  // Trigger loading on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      setShouldLoad(true)
    }

    const events = ['mousedown', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction)
      })
    }
  }, [])

  if (!shouldLoad) {
    return <>{children({ stripe: null, isLoading: false })}</>
  }

  if (isLoading) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoadingSpinner />
      </Suspense>
    )
  }

  if (!stripe) {
    return <>{children({ stripe: null, isLoading: false })}</>
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyElements stripe={stripe}>
        {children({ stripe, isLoading: false })}
      </LazyElements>
    </Suspense>
  )
}

// Hook for components that need Stripe
export function useOptimizedStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadStripe = async () => {
    if (isLoading || stripe) return

    setIsLoading(true)
    try {
      const { loadStripe: loadStripeJS } = await import('@stripe/stripe-js')
      const stripeInstance = await loadStripeJS(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      setStripe(stripeInstance)
    } catch (error) {
      console.error('Failed to load Stripe:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { stripe, isLoading, loadStripe }
}
