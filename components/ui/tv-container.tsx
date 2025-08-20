"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface TVContainerProps {
  children: React.ReactNode
  className?: string
  aspectRatio?: '4:3' | '16:9' | '21:9'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showReflection?: boolean
  neonColor?: 'blue' | 'purple' | 'cyan' | 'pink' | 'green'
}

export function TVContainer({ 
  children, 
  className, 
  aspectRatio = '16:9',
  size = 'md',
  showReflection = true,
  neonColor = 'blue'
}: TVContainerProps) {
  const aspectRatioClasses = {
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-[16/9]',
    '21:9': 'aspect-[21/9]'
  }

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  const neonColors = {
    blue: {
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
      border: 'border-blue-400/40',
      innerGlow: 'shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]',
      ambient: 'from-blue-500/15 via-cyan-500/8 to-blue-600/15'
    },
    purple: {
      glow: 'shadow-[0_0_30px_rgba(147,51,234,0.4)]',
      border: 'border-purple-400/40',
      innerGlow: 'shadow-[inset_0_0_20px_rgba(147,51,234,0.2)]',
      ambient: 'from-purple-500/15 via-pink-500/8 to-purple-600/15'
    },
    cyan: {
      glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
      border: 'border-cyan-400/40',
      innerGlow: 'shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]',
      ambient: 'from-cyan-500/15 via-blue-500/8 to-cyan-600/15'
    },
    pink: {
      glow: 'shadow-[0_0_30px_rgba(236,72,153,0.4)]',
      border: 'border-pink-400/40',
      innerGlow: 'shadow-[inset_0_0_20px_rgba(236,72,153,0.2)]',
      ambient: 'from-pink-500/15 via-purple-500/8 to-pink-600/15'
    },
    green: {
      glow: 'shadow-[0_0_30px_rgba(34,197,94,0.4)]',
      border: 'border-green-400/40',
      innerGlow: 'shadow-[inset_0_0_20px_rgba(34,197,94,0.2)]',
      ambient: 'from-green-500/15 via-emerald-500/8 to-green-600/15'
    }
  }

  const currentNeon = neonColors[neonColor]

  return (
    <div className={cn(
      'relative mx-auto',
      sizeClasses[size],
      'w-full', // Ensure full width on mobile
      className
    )}>
      {/* Glassmorphism TV Frame */}
      <div className={cn(
        'relative rounded-[2rem] p-4 sm:p-5 md:p-6',
        'bg-white/5 backdrop-blur-xl',
        'border border-white/20',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        currentNeon.glow,
        'before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none',
        'after:absolute after:inset-0 after:rounded-[2rem] after:bg-gradient-to-t after:from-black/10 after:to-transparent after:pointer-events-none'
      )}>
        {/* Inner Glass Layer */}
        <div className={cn(
          'absolute inset-1 rounded-[1.8rem]',
          'bg-gradient-to-br from-white/8 via-white/5 to-white/3',
          'backdrop-blur-lg',
          'border border-white/15'
        )} />
        
        {/* TV Screen Bezel - Glassmorphism */}
        <div className={cn(
          'relative rounded-[1.5rem] p-3 sm:p-4',
          'bg-white/8 backdrop-blur-2xl',
          'border border-white/25',
          'shadow-[inset_0_4px_16px_rgba(0,0,0,0.2)]',
          currentNeon.innerGlow
        )}>
          {/* Screen Content - Pure Glass */}
          <div className={cn(
            'relative overflow-hidden rounded-xl',
            aspectRatioClasses[aspectRatio],
            'bg-white/3 backdrop-blur-xl',
            'border border-white/20',
            'shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]'
          )}>
            {children}
            
            {/* Subtle Screen Reflection Effect */}
            {showReflection && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-t-xl"></div>
                <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-white/5 to-transparent rounded-l-xl"></div>
              </div>
            )}

            {/* Subtle Scan Lines Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-15">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-white/3 to-transparent" 
                   style={{
                     backgroundSize: '100% 3px',
                     backgroundRepeat: 'repeat-y'
                   }} />
            </div>
          </div>
        </div>

        {/* Futuristic Control Panel */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          {/* Power Indicator */}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
          
          {/* Control Dots */}
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          </div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-white/40 rounded-tl-lg"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-white/40 rounded-tr-lg"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-white/40 rounded-bl-lg"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-white/40 rounded-br-lg"></div>
      </div>

      {/* Ambient Glow - Subtle and glass-like */}
      <div className={cn(
        'absolute -inset-3 sm:-inset-4',
        'bg-gradient-to-r',
        currentNeon.ambient,
        'rounded-[2.5rem] blur-2xl -z-10 opacity-30'
      )}></div>

      {/* Additional Ambient Rings */}
      <div className={cn(
        'absolute -inset-6 sm:-inset-8',
        'bg-gradient-to-r',
        currentNeon.ambient,
        'rounded-[3.5rem] blur-3xl -z-20 opacity-15'
      )}></div>
    </div>
  )
}

interface TVImageProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
}

export function TVImage({ 
  src, 
  alt, 
  className, 
  fallback,
  onError,
  objectPosition = 'center',
  objectFit = 'cover'
}: TVImageProps) {
  const [imageError, setImageError] = React.useState(false)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true)
    onError?.(e)
  }

  if (imageError && fallback) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'w-full h-full transition-all duration-500',
        'hover:scale-105',
        'filter brightness-105 contrast-105',
        className
      )}
      style={{
        objectFit,
        objectPosition
      }}
      onError={handleError}
    />
  )
}

// Multi-image TV container for grid layouts
interface TVImageGridProps {
  images: string[]
  maxImages?: number
  className?: string
  aspectRatio?: '4:3' | '16:9' | '21:9'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  objectPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down'
  neonColor?: 'blue' | 'purple' | 'cyan' | 'pink' | 'green'
}

export function TVImageGrid({ 
  images, 
  maxImages = 4, 
  className,
  aspectRatio = '16:9',
  size = 'md',
  objectPosition = 'center',
  objectFit = 'cover',
  neonColor = 'blue'
}: TVImageGridProps) {
  const displayImages = images.slice(0, maxImages)
  const remainingCount = images.length - maxImages

  return (
    <TVContainer 
      className={className}
      aspectRatio={aspectRatio}
      size={size}
      neonColor={neonColor}
    >
      <div className={cn(
        'w-full h-full',
        displayImages.length === 1 ? 'block' : 'grid gap-1',
        displayImages.length === 2 ? 'grid-cols-2' :
        displayImages.length === 3 ? 'grid-cols-2' :
        displayImages.length === 4 ? 'grid-cols-2' : 'grid-cols-2'
      )}>
        {displayImages.map((image, index) => (
          <div 
            key={index} 
            className={cn(
              'relative overflow-hidden',
              displayImages.length === 3 && index === 2 ? 'col-span-2' : ''
            )}
          >
            <TVImage
              src={image}
              alt={`Image ${index + 1}`}
              objectPosition={objectPosition}
              objectFit={objectFit}
              fallback={
                <div className="w-full h-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white/70">
                    <span className="text-xs">Image failed to load</span>
                  </div>
                </div>
              }
            />
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="col-span-2 bg-white/10 flex items-center justify-center text-white/70 backdrop-blur-sm">
            <span className="text-sm font-medium">+{remainingCount} more</span>
          </div>
        )}
      </div>
    </TVContainer>
  )
}
