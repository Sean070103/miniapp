"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'
import { Button } from './button'
import { Avatar, AvatarFallback } from './avatar'
import { Heart, MessageSquare, Share2, BookOpen, Calendar, Trash2, Archive, MoreHorizontal } from 'lucide-react'

interface TVPostContainerProps {
  children: React.ReactNode
  className?: string
  neonColor?: 'blue' | 'purple' | 'cyan' | 'pink' | 'green'
  showReflection?: boolean
  hasImage?: boolean
  tvStyle?: 'retro' | 'modern' | 'futuristic' | 'vintage' | 'minimal'
  surface?: 'transparent' | 'dark'
}

export function TVPostContainer({ 
  children, 
  className,
  neonColor = 'cyan',
  showReflection = true,
  hasImage = false,
  tvStyle = 'modern',
  surface = 'dark'
}: TVPostContainerProps) {
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

  // Enhanced TV Styles for posts with images
  const tvStyles = {
    retro: {
      container: 'bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 border-amber-600 shadow-[0_12px_40px_rgba(245,158,11,0.4)]',
      screen: 'bg-gradient-to-br from-black via-gray-900 to-black border-amber-500/70 shadow-[inset_0_0_30px_rgba(245,158,11,0.3)]',
      bezel: 'bg-gradient-to-br from-amber-800 to-amber-900 border-amber-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      knobs: 'bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      brand: 'text-amber-300',
      scanlines: 'bg-gradient-to-b from-transparent via-amber-500/5 to-transparent'
    },
    modern: {
      container: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 border-slate-600 shadow-[0_12px_40px_rgba(71,85,105,0.4)]',
      screen: 'bg-gradient-to-br from-black via-slate-900 to-black border-slate-500/70 shadow-[inset_0_0_30px_rgba(71,85,105,0.3)]',
      bezel: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      knobs: 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      brand: 'text-slate-300',
      scanlines: 'bg-gradient-to-b from-transparent via-slate-500/5 to-transparent'
    },
    futuristic: {
      container: 'bg-gradient-to-br from-cyan-900 via-blue-800 to-purple-800 border-cyan-500 shadow-[0_12px_40px_rgba(6,182,212,0.5)]',
      screen: 'bg-gradient-to-br from-black via-cyan-900/20 to-black border-cyan-400/70 shadow-[inset_0_0_30px_rgba(6,182,212,0.4)]',
      bezel: 'bg-gradient-to-br from-cyan-800 to-blue-900 border-cyan-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      knobs: 'bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      brand: 'text-cyan-300',
      scanlines: 'bg-gradient-to-b from-transparent via-cyan-500/8 to-transparent'
    },
    vintage: {
      container: 'bg-gradient-to-br from-rose-900 via-rose-800 to-pink-800 border-rose-600 shadow-[0_12px_40px_rgba(225,29,72,0.4)]',
      screen: 'bg-gradient-to-br from-black via-rose-900/20 to-black border-rose-500/70 shadow-[inset_0_0_30px_rgba(225,29,72,0.3)]',
      bezel: 'bg-gradient-to-br from-rose-800 to-rose-900 border-rose-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      knobs: 'bg-gradient-to-br from-rose-600 to-rose-700 border-rose-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      brand: 'text-rose-300',
      scanlines: 'bg-gradient-to-b from-transparent via-rose-500/5 to-transparent'
    },
    minimal: {
      container: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border-gray-600 shadow-[0_12px_40px_rgba(75,85,99,0.4)]',
      screen: 'bg-gradient-to-br from-black via-gray-900 to-black border-gray-500/70 shadow-[inset_0_0_30px_rgba(75,85,99,0.3)]',
      bezel: 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      knobs: 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
      brand: 'text-gray-300',
      scanlines: 'bg-gradient-to-b from-transparent via-gray-500/5 to-transparent'
    }
  }

  const currentTVStyle = tvStyles[tvStyle]

  // TV effect removed – use single light card for all posts

  // Gaming-style post container
  return (
    <div className={cn(
      'relative w-full',
      className
    )}>
      {/* Gaming Post Container */}
      <div className={cn(
        'relative rounded-2xl p-4 sm:p-6',
        surface === 'transparent'
                  ? 'bg-white/10 border-2 border-green-500/50 backdrop-blur-md shadow-xl'
        : 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-2 border-green-500/30 backdrop-blur-sm shadow-xl',
        'pixel-card scanlines',
        'transition-all duration-300',
        'hover:scale-[1.02] hover:border-green-500/50',
        'hover:shadow-green-500/20'
      )}>
        <div className="pointer-events-none absolute inset-0 rounded-2xl pixel-shine"></div>
        {/* Content Area */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}

// Post Header Component
interface PostHeaderProps {
  user: {
    name?: string
    address: string
    avatar?: string
  }
  date: Date
  privacy?: string
  isOwner?: boolean
  isArchived?: boolean
  onArchive?: () => void
  onDelete?: () => void
  className?: string
}

export function PostHeader({ user, date, privacy, isOwner = false, isArchived = false, onArchive, onDelete, className }: PostHeaderProps) {
  return (
    <div className={cn(
      'flex items-center justify-between pb-4',
              'border-b border-green-500/30',
      className
    )}>
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12 border-2 border-green-500/50 shadow-lg shadow-green-500/20 ring-2 ring-green-500/20">
          <AvatarFallback className="bg-gradient-to-br from-green-600 to-green-700 text-green-100 font-bold text-sm pixelated-text">
            {user.name ? user.name.charAt(0).toUpperCase() : user.address.slice(2, 4).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <div className="text-green-100 font-bold text-base pixelated-text pixel-text-shadow">
            {user.name || `${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
          </div>
          <div className="flex items-center gap-3 text-green-300/70 text-xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className="pixelated-text">{date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}</span>
            </div>
            {privacy && (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-300 bg-green-900/30 pixelated-text font-bold">
                {privacy}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Owner Actions - "..." Button */}
      {isOwner && (
        <div className="relative group">
          <button className="pixel-button flex items-center justify-center w-9 h-9 rounded-lg text-green-300/70 hover:text-green-400 hover:bg-green-500/10 hover:scale-105 transition-all duration-300 border border-green-500/20 hover:border-green-500/40 shadow-lg shadow-green-500/10">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {/* Dropdown Menu - Enhanced Gaming Style */}
          <div className="absolute right-0 top-full mt-1 w-52 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-2 border-green-500/40 rounded-xl shadow-2xl shadow-green-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-right scale-95 group-hover:scale-100">
            <div className="p-2 space-y-1">
              {onArchive && (
                <button
                  onClick={onArchive}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 pixelated-text text-sm font-bold",
                    isArchived 
                      ? "text-green-300 hover:text-green-400 hover:bg-green-500/15 border border-green-500/20 hover:border-green-500/40" 
                      : "text-blue-300 hover:text-blue-400 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-500/40"
                  )}
                >
                  <Archive className="w-4 h-4" />
                  {isArchived ? "Restore Post" : "Archive Post"}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg transition-all duration-200 pixelated-text text-sm font-bold border border-red-500/20 hover:border-red-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Post Content Component
interface PostContentProps {
  content: string
  photos?: string[]
  className?: string
}

export function PostContent({ content, photos, className }: PostContentProps) {
  return (
    <div className={cn('py-3 space-y-4', className)}>
      {/* Text Content */}
      <div className="text-white leading-relaxed text-sm break-words font-medium">
        {content || "This user shared their crypto journey..."}
      </div>
      
      {/* Photos - Enhanced TV-style display */}
      {photos && photos.length > 0 && (
        <div className="relative">
          {photos.length === 1 ? (
            <div className="relative group">
              <img 
                src={photos[0]} 
                alt="Post image" 
                className="w-full h-auto max-h-80 rounded-lg object-cover shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl"
              />
              {/* Image Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={photo} 
                    alt={`Post image ${index + 1}`} 
                    className={cn(
                      "w-full h-32 object-cover rounded-lg shadow-lg transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-xl",
                      photos.length === 3 && index === 2 && "col-span-2 h-40"
                    )}
                  />
                  {/* Image Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
              {photos.length > 4 && (
                <div className="col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center h-32 text-gray-300 border border-gray-600 shadow-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold mb-1">+{photos.length - 4}</div>
                    <div className="text-xs opacity-80">more photos</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Post Tags Component
interface PostTagsProps {
  tags: string[]
  className?: string
}

export function PostTags({ tags, className }: PostTagsProps) {
  if (tags.length === 0) return null
  
  return (
    <div className={cn('pb-3', className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, tagIndex) => (
          <Badge 
            key={tagIndex} 
            className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-400/50 hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400/70 transition-all duration-300 cursor-pointer px-3 py-1 text-xs font-bold tracking-wide shadow-lg hover:shadow-green-500/20 pixelated-text"
          >
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}

// Post Actions Component
interface PostActionsProps {
  likes: number
  comments: number
  reposts: number
  isLiked?: boolean
  onLike?: () => void
  onComment?: () => void
  onRepost?: () => void
  onDelete?: () => void
  onArchive?: () => void
  loadingLikes?: boolean
  isOwner?: boolean
  isArchived?: boolean
  className?: string
  theme?: 'night' | 'dark'
}

export function PostActions({ 
  likes, 
  comments, 
  reposts, 
  isLiked = false, 
  onLike, 
  onComment, 
  onRepost,
  onDelete,
  onArchive,
  loadingLikes = false,
  isOwner = false,
  isArchived = false,
  className,
  theme = 'dark' 
}: PostActionsProps) {
  const palette = theme === 'night'
    ? {
        btn: 'bg-indigo-500/20 border border-indigo-300/40 text-indigo-50 hover:bg-indigo-500/30 hover:border-indigo-300/60 shadow-indigo-500/20',
        count: 'text-indigo-50'
      }
    : {
        btn: 'bg-emerald-500/20 border border-emerald-300/40 text-emerald-50 hover:bg-emerald-500/30 hover:border-emerald-300/60 shadow-emerald-500/20',
        count: 'text-emerald-50'
      }

  return (
    <div className={cn(
      'flex items-center justify-between pt-3 border-t border-green-500/30',
      'pb-2',
      className
    )}>
      <div className="flex items-center gap-6">
        {/* Enhanced Like Button */}
        <button 
          onClick={onLike}
          disabled={loadingLikes}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:scale-105',
            palette.btn,
            loadingLikes ? "opacity-50 cursor-not-allowed" : "",
            isLiked ? "!text-green-300 pixel-text-glow" : ""
          )}
        >
          <div className="relative">
            {loadingLikes ? (
              <div className="pixel-loading w-5 h-5 rounded-full"></div>
            ) : (
              <Heart className={cn(
                'w-5 h-5 transition-all duration-300',
                isLiked ? "text-green-400 fill-green-400 pixel-text-glow" : "text-white/80 hover:text-white hover:scale-110"
              )} />
            )}
          </div>
          <span className={cn('text-sm font-bold pixel-text-shadow', palette.count)}>{likes}</span>
        </button>

        {/* Enhanced Comment Button */}
        <button
          onClick={onComment}
          className={cn('flex items-center gap-2 px-3 py-2 rounded-full hover:scale-105 transition-all duration-300', palette.btn)}
        >
          <MessageSquare className="w-5 h-5 hover:scale-110 transition-transform duration-300" />
          <span className={cn('text-sm font-bold pixel-text-shadow', palette.count)}>{comments}</span>
        </button>

        {/* Enhanced Repost Button */}
        <button
          onClick={onRepost}
          className={cn('flex items-center gap-2 px-3 py-2 rounded-full hover:scale-105 transition-all duration-300', palette.btn)}
        >
          <Share2 className="w-5 h-5 hover:scale-110 transition-transform duration-300" />
          <span className={cn('text-sm font-bold pixel-text-shadow', palette.count)}>{reposts}</span>
        </button>
      </div>


    </div>
  )
}
