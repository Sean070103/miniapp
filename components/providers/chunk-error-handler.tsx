"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface ChunkErrorHandlerProps {
  children: React.ReactNode
}

export function ChunkErrorHandler({ children }: ChunkErrorHandlerProps) {
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Handle chunk loading errors
    const handleChunkError = (event: ErrorEvent) => {
      if (event.message.includes('Loading chunk') || event.message.includes('ChunkLoadError')) {
        console.error('Chunk loading error detected:', event)
        setErrorMessage(event.message)
        setHasError(true)
      }
    }

    // Handle unhandled promise rejections (often chunk loading failures)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && 
          (event.reason.includes('Loading chunk') || event.reason.includes('ChunkLoadError'))) {
        console.error('Unhandled chunk loading rejection:', event.reason)
        setErrorMessage(event.reason)
        setHasError(true)
      }
    }

    // Handle script loading errors
    const handleScriptError = (event: Event) => {
      const target = event.target as HTMLScriptElement
      if (target && target.src && target.src.includes('_next/static/chunks')) {
        console.error('Script loading error:', target.src)
        setErrorMessage(`Failed to load script: ${target.src}`)
        setHasError(true)
      }
    }

    // Add event listeners
    window.addEventListener('error', handleChunkError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleScriptError, true)

    // Cleanup function
    return () => {
      window.removeEventListener('error', handleChunkError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleScriptError, true)
    }
  }, [])

  const handleRetry = () => {
    // Clear any cached chunks and reload
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('next') || cacheName.includes('chunk')) {
            caches.delete(cacheName)
          }
        })
      })
    }
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister()
        })
      })
    }

    // Reload the page
    window.location.reload()
  }

  const handleHardRefresh = () => {
    // Force a hard refresh by clearing all caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
        })
      })
    }
    
    // Clear localStorage and sessionStorage
    localStorage.clear()
    sessionStorage.clear()
    
    // Force reload without cache
    window.location.href = window.location.href
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Error
          </h2>
          
          <p className="text-gray-600 mb-4 text-sm">
            We encountered an issue loading the application. This is usually a temporary problem.
          </p>
          
          {errorMessage && (
            <div className="bg-gray-100 rounded-md p-3 mb-4 text-xs text-gray-700 font-mono">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleHardRefresh}
              variant="outline"
              className="w-full"
            >
              Hard Refresh
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            If the problem persists, try clearing your browser cache or using a different browser.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
