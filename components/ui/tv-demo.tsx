"use client"

import React from 'react'
import { TVContainer, TVImage, TVImageGrid } from './tv-container'

export function TVDemo() {
  const sampleImages = [
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=600&fit=crop'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Futuristic TV Container Demo</h1>
          <p className="text-slate-300 text-lg">Sleek neon-edged television frames for your images</p>
        </div>

        {/* Neon Color Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Neon Color Variants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="space-y-4">
              <h3 className="text-white text-center">Blue</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="blue">
                <TVImage 
                  src={sampleImages[0]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Purple</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="purple">
                <TVImage 
                  src={sampleImages[1]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Cyan</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="cyan">
                <TVImage 
                  src={sampleImages[2]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Pink</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="pink">
                <TVImage 
                  src={sampleImages[3]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Green</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="green">
                <TVImage 
                  src={sampleImages[0]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>
          </div>
        </div>

        {/* Single Image Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Single Image Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-white text-center">Small</h3>
              <TVContainer size="sm" aspectRatio="16:9" neonColor="cyan">
                <TVImage 
                  src={sampleImages[0]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Medium</h3>
              <TVContainer size="md" aspectRatio="16:9" neonColor="purple">
                <TVImage 
                  src={sampleImages[1]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Large</h3>
              <TVContainer size="lg" aspectRatio="16:9" neonColor="pink">
                <TVImage 
                  src={sampleImages[2]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">Extra Large</h3>
              <TVContainer size="xl" aspectRatio="16:9" neonColor="green">
                <TVImage 
                  src={sampleImages[3]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Aspect Ratio Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-white text-center">4:3 Ratio</h3>
              <TVContainer size="md" aspectRatio="4:3" neonColor="blue">
                <TVImage 
                  src={sampleImages[0]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">16:9 Ratio</h3>
              <TVContainer size="md" aspectRatio="16:9" neonColor="cyan">
                <TVImage 
                  src={sampleImages[1]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">21:9 Ratio</h3>
              <TVContainer size="md" aspectRatio="21:9" neonColor="purple">
                <TVImage 
                  src={sampleImages[2]} 
                  alt="Sample image"
                  fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
                />
              </TVContainer>
            </div>
          </div>
        </div>

        {/* Multi-Image Grid Examples */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Multi-Image Grid Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-white text-center">2 Images</h3>
              <TVImageGrid
                images={sampleImages.slice(0, 2)}
                maxImages={4}
                size="md"
                aspectRatio="16:9"
                neonColor="cyan"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">3 Images</h3>
              <TVImageGrid
                images={sampleImages.slice(0, 3)}
                maxImages={4}
                size="md"
                aspectRatio="16:9"
                neonColor="pink"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">4 Images</h3>
              <TVImageGrid
                images={sampleImages}
                maxImages={4}
                size="md"
                aspectRatio="16:9"
                neonColor="purple"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-white text-center">5+ Images (showing +1)</h3>
              <TVImageGrid
                images={[...sampleImages, sampleImages[0]]}
                maxImages={4}
                size="md"
                aspectRatio="16:9"
                neonColor="green"
              />
            </div>
          </div>
        </div>

        {/* No Reflection Example */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center">Without Reflection Effect</h2>
          
          <div className="flex justify-center">
            <TVContainer size="lg" aspectRatio="16:9" showReflection={false} neonColor="blue">
              <TVImage 
                src={sampleImages[0]} 
                alt="Sample image without reflection"
                fallback={<div className="w-full h-full bg-slate-800/50 flex items-center justify-center text-slate-400 backdrop-blur-sm">Image failed to load</div>}
              />
            </TVContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
