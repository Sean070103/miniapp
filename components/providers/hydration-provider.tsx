"use client"

import { useState, useEffect } from 'react'

interface HydrationProviderProps {
  children: React.ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true)
    }, 100) // Small delay to ensure proper hydration

    return () => clearTimeout(timer)
  }, [])

  // Enhanced chunk loading error handling
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Loading chunk') || event.message.includes('ChunkLoadError')) {
        console.error('Chunk loading error detected:', event.message)
        setHasError(true)
        
        // Try to recover by clearing cache and reloading
        setTimeout(() => {
          if ('caches' in window) {
            caches.keys().then(cacheNames => {
              cacheNames.forEach(cacheName => {
                if (cacheName.includes('next') || cacheName.includes('chunk')) {
                  caches.delete(cacheName)
                }
              })
            })
          }
          window.location.reload()
        }, 2000)
      }
    }

    // Handle unhandled promise rejections (often chunk loading failures)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && 
          (event.reason.includes('Loading chunk') || event.reason.includes('ChunkLoadError'))) {
        console.error('Unhandled chunk loading rejection:', event.reason)
        setHasError(true)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Show error state
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-300 text-lg mb-2">Loading error detected</p>
          <p className="text-gray-400 text-sm">Reloading page...</p>
        </div>
      </div>
    )
  }

  // Show a loading state or skeleton while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">Loading DailyBase...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
