import { useEffect, useState } from 'react'

interface InteractionTrackerProps {
  onInteraction: () => void
  children: React.ReactNode
}

export default function InteractionTracker({ onInteraction, children }: InteractionTrackerProps) {
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (hasInteracted) return

    const handleInteraction = () => {
      setHasInteracted(true)
      onInteraction()
    }

    // Track meaningful user interactions
    const events = [
      'mousedown',
      'touchstart', 
      'keydown',
      'scroll',
      'wheel',
      'pointerdown'
    ]

    const options = { 
      once: true, 
      passive: true,
      capture: true 
    }

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, options)
    })

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction, options)
      })
    }
  }, [hasInteracted, onInteraction])

  return <>{children}</>
}

// Hook for components that need interaction state
export function useInteractionState() {
  const [hasInteracted, setHasInteracted] = useState(false)

  const markInteracted = () => setHasInteracted(true)

  return { hasInteracted, markInteracted }
}
