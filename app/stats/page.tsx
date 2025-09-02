"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Calendar,
  Target,
  Award,
  Activity,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react'

interface UserAnalytics {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalReposts: number
  totalFollowers: number
  totalFollowing: number
  currentStreak: number
  longestStreak: number
  engagementRate: number
  lastActive: string
}

export default function StatsPage() {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user ID from localStorage or use default
      const userAddress = localStorage.getItem('userAddress') || '0x9dEad829289E77954bce6C7E7403c99a86c68C85'
      
      // Fetch user analytics with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`/api/analytics/user?userId=${userAddress}&period=30d`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setUserAnalytics(data.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError('Failed to load analytics data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">Loading your statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Stats</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Arcade Hero */}
        <div className="text-center mb-10 screen-curved pixel-rounded arcade-bezel relative p-6">
          <div className="arcade-marquee pixel-text-shadow text-sm tracking-widest">
            <span className="pixelated-text">STATS DASHBOARD</span>
          </div>
          <div className="mt-6">
            <h1 className="text-4xl font-bold text-white mb-4 pixelated-text">Track your DailyBase journey and progress</h1>
            <p className="text-blue-300 text-lg max-w-3xl mx-auto">Gain gaming-precision insights into your posting streaks, engagement, and milestones. Power up your consistency and level up your community impact.</p>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              onClick={fetchAnalytics}
              className="btn-arcade btn-arcade-green px-4 py-2 text-black font-semibold"
            >
              INSERT COIN
            </Button>
            <Button
              onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-arcade btn-arcade-blue px-6 py-2 text-white font-semibold"
            >
              START
            </Button>
            <Button
              onClick={() => fetchAnalytics()}
              variant="outline"
              className="btn-arcade btn-arcade-yellow px-6 py-2 text-black font-semibold"
            >
              SELECT
            </Button>
          </div>
        </div>

        {/* Header */}
        <div ref={contentRef} className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 pixelated-text">Your DailyBase Statistics</h2>
          <p className="text-blue-300 text-lg">Track your progress and engagement</p>
          {lastUpdated && (
            <p className="text-sm text-gray-400 mt-2">
              Last updated: {formatDate(lastUpdated.toISOString())}
            </p>
          )}
          {userAnalytics?.lastActive && (
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1 text-blue-300" /> Last Active: {formatDate(userAnalytics.lastActive)}
            </p>
          )}
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-300">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white pixelated-text">{formatNumber(userAnalytics?.totalPosts || 0)}</div>
              <p className="text-xs text-gray-400 mt-1">Journal entries created</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-300">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white pixelated-text">{formatNumber(userAnalytics?.totalLikes || 0)}</div>
              <p className="text-xs text-gray-400 mt-1">Likes received</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">Current Streak</CardTitle>
              <Zap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white pixelated-text">{userAnalytics?.currentStreak || 0} days</div>
              <p className="text-xs text-gray-400 mt-1">
                Longest: {userAnalytics?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white pixelated-text">
                {((userAnalytics?.engagementRate || 0) * 100).toFixed(1)}%
              </div>
              <Progress 
                value={(userAnalytics?.engagementRate || 0) * 100} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Summary */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Activity Summary</CardTitle>
              <CardDescription className="text-gray-400">
                Your overall activity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {userAnalytics?.totalComments || 0}
                    </div>
                    <div className="text-sm text-gray-400">Comments</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {userAnalytics?.totalReposts || 0}
                    </div>
                    <div className="text-sm text-gray-400">Reposts</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {userAnalytics?.totalFollowers || 0}
                    </div>
                    <div className="text-sm text-gray-400">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">
                      {userAnalytics?.totalFollowing || 0}
                    </div>
                    <div className="text-sm text-gray-400">Following</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Progress */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Streak Progress</CardTitle>
              <CardDescription className="text-gray-400">
                Your consistency journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white">Current Streak</span>
                  <Badge variant="secondary" className="bg-green-600">
                    {userAnalytics?.currentStreak || 0} days
                  </Badge>
                </div>
                <Progress 
                  value={((userAnalytics?.currentStreak || 0) / Math.max(userAnalytics?.longestStreak || 1, 1)) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-white">Longest Streak</span>
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    {userAnalytics?.longestStreak || 0} days
                  </Badge>
                </div>
                <div className="text-center mt-4">
                  <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Keep up the great work! Consistency is key.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="text-white">Achievements</CardTitle>
            <CardDescription className="text-gray-400">
              Your milestones and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userAnalytics?.longestStreak && userAnalytics.longestStreak >= 7 && (
                <div className="flex items-center space-x-3 p-3 bg-green-600/20 rounded-lg border border-green-600/30">
                  <Award className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Week Warrior</div>
                    <div className="text-xs text-green-300">7+ day streak achieved</div>
                  </div>
                </div>
              )}
              
              {userAnalytics?.totalPosts && userAnalytics.totalPosts >= 10 && (
                <div className="flex items-center space-x-3 p-3 bg-blue-600/20 rounded-lg border border-blue-600/30">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Content Creator</div>
                    <div className="text-xs text-blue-300">10+ posts published</div>
                  </div>
                </div>
              )}
              
              {userAnalytics?.totalLikes && userAnalytics.totalLikes >= 50 && (
                <div className="flex items-center space-x-3 p-3 bg-pink-600/20 rounded-lg border border-pink-600/30">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Liked & Loved</div>
                    <div className="text-xs text-pink-300">50+ likes received</div>
                  </div>
                </div>
              )}
              
              {userAnalytics?.totalFollowers && userAnalytics.totalFollowers >= 5 && (
                <div className="flex items-center space-x-3 p-3 bg-purple-600/20 rounded-lg border border-purple-600/30">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Community Builder</div>
                    <div className="text-xs text-purple-300">5+ followers gained</div>
                  </div>
                </div>
              )}

              {(!userAnalytics?.longestStreak || userAnalytics.longestStreak < 7) && 
               (!userAnalytics?.totalPosts || userAnalytics.totalPosts < 10) && 
               (!userAnalytics?.totalLikes || userAnalytics.totalLikes < 50) && 
               (!userAnalytics?.totalFollowers || userAnalytics.totalFollowers < 5) && (
                <div className="col-span-full text-center p-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Achievements Yet</h3>
                  <p className="text-gray-400 mb-4">Keep posting and engaging to unlock achievements!</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-gray-400">
                      <div className="font-medium">7 days</div>
                      <div>for Week Warrior</div>
                    </div>
                    <div className="text-gray-400">
                      <div className="font-medium">10 posts</div>
                      <div>for Content Creator</div>
                    </div>
                    <div className="text-gray-400">
                      <div className="font-medium">50 likes</div>
                      <div>for Liked & Loved</div>
                    </div>
                    <div className="text-gray-400">
                      <div className="font-medium">5 followers</div>
                      <div>for Community Builder</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <Button 
            onClick={fetchAnalytics} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
        </div>
      </div>
    </div>
  )
}
