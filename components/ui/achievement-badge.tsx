"use client"

import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Flame, Target, Zap, Crown, Gem, Heart } from "lucide-react"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: 'trophy' | 'star' | 'flame' | 'target' | 'zap' | 'crown' | 'gem' | 'heart'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  progress?: number
  maxProgress?: number
  unlockedAt?: Date
}

interface AchievementBadgeProps {
  achievement: Achievement
  showProgress?: boolean
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const getIcon = (icon: Achievement['icon']) => {
  switch (icon) {
    case 'trophy': return <Trophy className="w-4 h-4" />
    case 'star': return <Star className="w-4 h-4" />
    case 'flame': return <Flame className="w-4 h-4" />
    case 'target': return <Target className="w-4 h-4" />
    case 'zap': return <Zap className="w-4 h-4" />
    case 'crown': return <Crown className="w-4 h-4" />
    case 'gem': return <Gem className="w-4 h-4" />
    case 'heart': return <Heart className="w-4 h-4" />
  }
}

const getRarityColors = (rarity: Achievement['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'bg-gradient-to-r from-slate-500/20 to-gray-500/20 border-slate-400/30 text-slate-300'
    case 'rare':
      return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300'
    case 'epic':
      return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-300'
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30 text-yellow-300'
  }
}

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'px-2 py-1 text-xs'
    case 'md':
      return 'px-3 py-2 text-sm'
    case 'lg':
      return 'px-4 py-3 text-base'
  }
}

export function AchievementBadge({ 
  achievement, 
  showProgress = false, 
  size = 'md',
  onClick 
}: AchievementBadgeProps) {
  const isUnlocked = achievement.unlocked
  const progress = achievement.progress || 0
  const maxProgress = achievement.maxProgress || 1
  const progressPercentage = (progress / maxProgress) * 100

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
      onClick={onClick}
    >
      <Badge 
        className={`${getRarityColors(achievement.rarity)} ${getSizeClasses(size)} pixelated-text font-bold border-2 backdrop-blur-sm shadow-lg ${
          isUnlocked 
            ? 'opacity-100 hover:shadow-xl' 
            : 'opacity-50 grayscale'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`transition-all duration-300 ${
            isUnlocked ? 'animate-pulse' : ''
          }`}>
            {getIcon(achievement.icon)}
          </div>
          <span>{achievement.name}</span>
        </div>
      </Badge>
      
      {/* Progress bar for locked achievements */}
      {!isUnlocked && showProgress && maxProgress > 1 && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
      
      {/* Unlock animation */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-ping opacity-75" />
      )}
    </div>
  )
}

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((achievement) => (
        <AchievementBadge 
          key={achievement.id} 
          achievement={achievement} 
          showProgress={true}
          size="md"
        />
      ))}
    </div>
  )
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-post',
    name: 'First Post',
    description: 'Create your first post',
    icon: 'star',
    rarity: 'common',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day posting streak',
    icon: 'flame',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'likes-100',
    name: 'Popular',
    description: 'Receive 100 total likes',
    icon: 'heart',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  },
  {
    id: 'posts-50',
    name: 'Content Creator',
    description: 'Create 50 posts',
    icon: 'trophy',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'comments-25',
    name: 'Engager',
    description: 'Make 25 comments',
    icon: 'zap',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 25
  },
  {
    id: 'reposts-10',
    name: 'Influencer',
    description: 'Get 10 reposts',
    icon: 'crown',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  }
]
