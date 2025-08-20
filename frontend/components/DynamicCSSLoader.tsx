import { useEffect } from 'react'

interface DynamicCSSLoaderProps {
  href: string
  media?: string
  onLoad?: () => void
}

export default function DynamicCSSLoader({ href, media = 'all', onLoad }: DynamicCSSLoaderProps) {
  useEffect(() => {
    // Check if CSS is already loaded
    const existingLink = document.querySelector(`link[href="${href}"]`)
    if (existingLink) {
      onLoad?.()
      return
    }

    // Create and load CSS dynamically
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = media
    
    link.onload = () => {
      onLoad?.()
    }
    
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${href}`)
    }

    document.head.appendChild(link)

    return () => {
      // Cleanup on unmount
      const linkToRemove = document.querySelector(`link[href="${href}"]`)
      if (linkToRemove && linkToRemove.parentNode) {
        linkToRemove.parentNode.removeChild(linkToRemove)
      }
    }
  }, [href, media, onLoad])

  return null
}

// Hook for loading CSS dynamically
export function useDynamicCSS(href: string, condition: boolean = true) {
  useEffect(() => {
    if (!condition) return

    const existingLink = document.querySelector(`link[href="${href}"]`)
    if (existingLink) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = 'all'
    
    document.head.appendChild(link)

    return () => {
      const linkToRemove = document.querySelector(`link[href="${href}"]`)
      if (linkToRemove && linkToRemove.parentNode) {
        linkToRemove.parentNode.removeChild(linkToRemove)
      }
    }
  }, [href, condition])
}
