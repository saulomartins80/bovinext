import { Suspense, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe, Stripe } from '@stripe/stripe-js'

interface LazyStripeProps {
  children: React.ReactNode
  publishableKey: string
}

export default function LazyStripeOptimized({ children, publishableKey }: LazyStripeProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    if (publishableKey && !stripePromise) {
      setStripePromise(loadStripe(publishableKey))
    }
  }, [publishableKey, stripePromise])

  if (!stripePromise) {
    return <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
  }

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </Suspense>
  )
}
