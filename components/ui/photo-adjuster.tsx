"use client"

import React, { useState } from 'react'
import { TVContainer, TVImage } from './tv-container'
import { Button } from './button'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize, Minimize, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoAdjusterProps {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  aspectRatio?: '4:3' | '16:9' | '21:9'
}

export function PhotoAdjuster({ 
  src, 
  alt, 
  size = 'md',
  aspectRatio = '16:9'
}: PhotoAdjusterProps) {
  const [objectPosition, setObjectPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center')
  const [objectFit, setObjectFit] = useState<'cover' | 'contain' | 'fill' | 'scale-down'>('cover')
  const [neonColor, setNeonColor] = useState<'blue' | 'purple' | 'cyan' | 'pink' | 'green'>('cyan')

  const positionOptions = [
    { value: 'center', label: 'Center', icon: Maximize },
    { value: 'top', label: 'Top', icon: ArrowUp },
    { value: 'bottom', label: 'Bottom', icon: ArrowDown },
    { value: 'left', label: 'Left', icon: ArrowLeft },
    { value: 'right', label: 'Right', icon: ArrowRight },
    { value: 'top-left', label: 'Top Left', icon: ArrowUp },
    { value: 'top-right', label: 'Top Right', icon: ArrowUp },
    { value: 'bottom-left', label: 'Bottom Left', icon: ArrowDown },
    { value: 'bottom-right', label: 'Bottom Right', icon: ArrowDown },
  ] as const

  const fitOptions = [
    { value: 'cover', label: 'Cover' },
    { value: 'contain', label: 'Contain' },
    { value: 'fill', label: 'Fill' },
    { value: 'scale-down', label: 'Scale Down' },
  ] as const

  const neonOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'cyan', label: 'Cyan', color: 'bg-cyan-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
  ] as const

  return (
    <div className="space-y-6">
      {/* TV Container with Image */}
      <div className="flex justify-center">
        <TVContainer size={size} aspectRatio={aspectRatio} neonColor={neonColor}>
          <TVImage
            src={src}
            alt={alt}
            objectPosition={objectPosition}
            objectFit={objectFit}
            fallback={
              <div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">
                <span className="text-sm">Image failed to load</span>
              </div>
            }
          />
        </TVContainer>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Neon Color Controls */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Neon Color
          </h3>
          <div className="flex gap-2">
            {neonOptions.map((option) => (
              <Button
                key={option.value}
                variant={neonColor === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setNeonColor(option.value)}
                className="flex items-center gap-2"
              >
                <div className={cn("w-3 h-3 rounded-full", option.color)}></div>
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Position Controls */}
        <div>
          <h3 className="text-white font-semibold mb-3">Image Position</h3>
          <div className="grid grid-cols-3 gap-2">
            {positionOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={objectPosition === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setObjectPosition(option.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Fit Controls */}
        <div>
          <h3 className="text-white font-semibold mb-3">Image Fit</h3>
          <div className="flex gap-2">
            {fitOptions.map((option) => (
              <Button
                key={option.value}
                variant={objectFit === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setObjectFit(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Settings Display */}
        <div className="bg-slate-800/50 rounded-lg p-4 backdrop-blur-sm border border-slate-700/50">
          <h4 className="text-white font-semibold mb-2">Current Settings</h4>
          <div className="text-slate-300 text-sm space-y-1">
            <p><span className="font-medium">Neon Color:</span> {neonColor}</p>
            <p><span className="font-medium">Position:</span> {objectPosition}</p>
            <p><span className="font-medium">Fit:</span> {objectFit}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
