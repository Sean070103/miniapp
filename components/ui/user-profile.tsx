"use client"

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Calendar, 
  MapPin, 
  Link, 
  Edit, 
  Settings, 
  Trophy, 
  Star, 
  Flame, 
  Heart, 
  MessageSquare, 
  Share2,
  TrendingUp,
  Users,
  FileText,
  Hash
} from 'lucide-react'
import { AchievementBadge, Achievement } from './achievement-badge'

interface UserStats {
  posts: number
  followers: number
  following: number
  likes: number
  comments: number
  reposts: number
  streak: number
  level: number
  xp: number
  nextLevelXp: number
}

interface UserProfileProps {
  user: {
    id: string
    address: string
    username?: string
    displayName?: string
    bio?: string
    avatar?: string
    location?: string
    website?: string
    joinedDate: Date
    isVerified?: boolean
  }
  stats: UserStats
  achievements: Achievement[]
  isOwnProfile?: boolean
  onEdit?: () => void
  onFollow?: () => void
}

export function UserProfile({ 
  user, 
  stats, 
  achievements, 
  isOwnProfile = false, 
  onEdit, 
  onFollow 
}: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    onFollow?.()
  }

  const getLevelProgress = () => {
    return (stats.xp / stats.nextLevelXp) * 100
  }

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-yellow-500 to-orange-500'
    if (level >= 25) return 'from-purple-500 to-pink-500'
    if (level >= 10) return 'from-blue-500 to-cyan-500'
    return 'from-green-500 to-emerald-500'
  }

  const displayedAchievements = showAllAchievements ? achievements : achievements.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-600/60 text-white backdrop-blur-sm card-glass shadow-xl">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-blue-400/30 hover:ring-blue-400/60 transition-all duration-300">
                  <AvatarImage src={user.avatar} alt={user.displayName || user.address} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-3xl">
                    {user.displayName?.slice(0, 2).toUpperCase() || user.address.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>
              
              {/* Level Badge */}
              <div className="text-center">
                <Badge className={`bg-gradient-to-r ${getLevelColor(stats.level)} text-white border-0 pixelated-text font-bold text-lg px-4 py-2`}>
                  Level {stats.level}
                </Badge>
                <div className="mt-2 w-32 bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)} transition-all duration-500`}
                    style={{ width: `${getLevelProgress()}%` }}
                  />
                </div>
                <p className="text-slate-400 pixelated-text text-sm mt-1">
                  {stats.xp} / {stats.nextLevelXp} XP
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-white pixelated-text">
                    {user.displayName || user.username || user.address.slice(0, 6) + '...' + user.address.slice(-4)}
                  </h1>
                  {user.isVerified && (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                      Verified
                    </Badge>
                  )}
                </div>
                
                <p className="text-slate-300 pixelated-text text-lg">
                  {user.bio || "Crypto enthusiast and blockchain explorer"}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-slate-400 pixelated-text">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user.joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isOwnProfile ? (
                  <>
                    <Button onClick={onEdit} className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white pixelated-text px-6 py-3">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 pixelated-text px-6 py-3">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollow}
                      className={`pixelated-text px-8 py-3 ${
                        isFollowing 
                          ? 'bg-slate-600 text-slate-300 hover:bg-slate-700' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50 pixelated-text px-6 py-3">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.posts}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <FileText className="w-4 h-4" />
              Posts
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.followers}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              Followers
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.following}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <User className="w-4 h-4" />
              Following
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.likes}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <Heart className="w-4 h-4" />
              Likes
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.comments}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Comments
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.reposts}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <Share2 className="w-4 h-4" />
              Reposts
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white pixelated-text">{stats.streak}</div>
            <div className="text-slate-400 pixelated-text text-sm flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              Day Streak
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
            <Trophy className="w-6 h-6" />
            Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {displayedAchievements.map((achievement) => (
              <AchievementBadge 
                key={achievement.id} 
                achievement={achievement} 
                showProgress={true}
                size="sm"
              />
            ))}
          </div>
          
          {achievements.length > 6 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAllAchievements(!showAllAchievements)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 pixelated-text"
              >
                {showAllAchievements ? 'Show Less' : `Show All ${achievements.length} Achievements`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
