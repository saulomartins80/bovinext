import { useEffect } from 'react'
import Image from 'next/image'

// Component to optimize critical images for LCP
export default function CriticalImageOptimizer() {
  useEffect(() => {
    // Optimize all images for LCP
    const optimizeImages = () => {
      // Find all images that could be LCP candidates
      const images = document.querySelectorAll('img')
      
      images.forEach((img, index) => {
        // Mark first few images as critical
        if (index < 3) {
          img.loading = 'eager'
          img.decoding = 'sync'
          img.fetchPriority = 'high'
          
          // Add data attribute for identification
          img.setAttribute('data-lcp-candidate', 'true')
          
          // Ensure image is visible immediately
          if (img.style.opacity === '0') {
            img.style.opacity = '1'
          }
        } else {
          // Lazy load non-critical images
          img.loading = 'lazy'
          img.decoding = 'async'
        }
      })
      
      // Optimize background images
      const elementsWithBg = document.querySelectorAll('[style*="background-image"]')
      elementsWithBg.forEach((el, index) => {
        if (index < 2 && el instanceof HTMLElement) {
          // Preload critical background images
          const bgImage = String(el.style.backgroundImage || '')
          const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/)
          
          if (urlMatch && urlMatch[1]) {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = urlMatch[1]
            link.fetchPriority = 'high'
            document.head.appendChild(link)
          }
        }
      })
    }

    // Run optimization
    optimizeImages()
    
    // Re-run after DOM changes
    const observer = new MutationObserver(() => {
      optimizeImages()
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  return null
}

// Optimized Image component for critical images
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  fill?: boolean
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  className = '',
  fill = false 
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      className={className}
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Kcp4DyvP8jjdFvLfUdQgvEkitbmGVZEWVGjkRlYqwBBBBBBB5HcHkWdvbS2d1DdW8qT28yLJDNE4dJI2UMrKw4ZWBBB7EEggg/9k="
      sizes={priority ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
      style={{
        objectFit: 'cover',
        width: fill ? '100%' : 'auto',
        height: fill ? '100%' : 'auto'
      }}
      onLoad={(e) => {
        // Mark as loaded for LCP tracking
        const img = e.target as HTMLImageElement
        img.setAttribute('data-loaded', 'true')
      }}
    />
  )
}
