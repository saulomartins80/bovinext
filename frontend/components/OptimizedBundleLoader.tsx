import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface OptimizedBundleLoaderProps {
  children: React.ReactNode
}

const OptimizedBundleLoader = ({ children }: OptimizedBundleLoaderProps) => {
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mark as hydrated after initial render
    setIsHydrated(true)

    // Preload critical routes on idle
    const preloadRoutes = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          router.prefetch('/dashboard')
          router.prefetch('/auth/login')
          router.prefetch('/precos')
        })
      } else {
        setTimeout(() => {
          router.prefetch('/dashboard')
          router.prefetch('/auth/login')
          router.prefetch('/precos')
        }, 2000)
      }
    }

    preloadRoutes()
  }, [router])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default OptimizedBundleLoader
