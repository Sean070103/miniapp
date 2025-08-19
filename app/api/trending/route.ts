import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trending - Get trending content with smart algorithm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'posts' // 'posts', 'tags', 'users'
    const period = searchParams.get('period') || '24h' // '1h', '24h', '7d', '30d'
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || undefined // Optional category filter

    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    let trendingData

    switch (type) {
      case 'posts':
        trendingData = await getTrendingPosts(startDate, limit, category)
        break
      case 'tags':
        trendingData = await getTrendingTags(startDate, limit)
        break
      case 'users':
        trendingData = await getTrendingUsers(startDate, limit)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: trendingData,
      type,
      period
    })
  } catch (error) {
    console.error('Error in Trending GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getTrendingPosts(startDate: Date, limit: number, category?: string) {
  // Build where clause
  const whereClause: any = {
    dateCreated: { gte: startDate },
    privacy: 'public',
    isHidden: false
  }

  if (category) {
    whereClause.tags = { hasSome: [category] }
  }

  // Get posts with engagement data
  const posts = await prisma.journal.findMany({
    where: whereClause,
    include: {
      contentAnalytics: true
    },
    orderBy: { dateCreated: 'desc' }
  })

  // Calculate trending score for each post
  const postsWithScore = posts.map(post => {
    const timeDecay = calculateTimeDecay(post.dateCreated)
    const engagementScore = calculateEngagementScore(post.contentAnalytics)
    const trendingScore = timeDecay * engagementScore

    return {
      ...post,
      trendingScore
    }
  })

  // Sort by trending score and return top results
  return postsWithScore
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
}

async function getTrendingTags(startDate: Date, limit: number) {
  // Get all posts in the time period
  const posts = await prisma.journal.findMany({
    where: {
      dateCreated: { gte: startDate },
      privacy: 'public'
    },
    select: {
      tags: true,
      contentAnalytics: true
    }
  })

  // Count tag occurrences and calculate scores
  const tagScores: { [key: string]: number } = {}

  posts.forEach(post => {
    const engagementScore = calculateEngagementScore(post.contentAnalytics)
    
    post.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0
      }
      tagScores[tag] += engagementScore
    })
  })

  // Convert to array and sort
  const trendingTags = Object.entries(tagScores)
    .map(([tag, score]) => ({ tag, score, count: posts.filter(p => p.tags.includes(tag)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return trendingTags
}

async function getTrendingUsers(startDate: Date, limit: number) {
  // Get users with high activity and engagement
  const users = await prisma.baseUser.findMany({
    include: {
      userAnalytics: true,
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  // Calculate trending score for each user
  const usersWithScore = await Promise.all(users.map(async (user) => {
    const activityScore = await calculateUserActivityScore(user, startDate)
    const followerScore = Math.log(user._count.followers + 1) * 10
    const engagementScore = user.userAnalytics?.engagementRate || 0
    
    const trendingScore = activityScore + followerScore + engagementScore

    return {
      ...user,
      trendingScore
    }
  }))

  // Sort by trending score and return top results
  return usersWithScore
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)
}

function calculateTimeDecay(dateCreated: Date): number {
  const now = new Date()
  const hoursSinceCreation = (now.getTime() - dateCreated.getTime()) / (1000 * 60 * 60)
  
  // Exponential decay: newer posts get higher scores
  return Math.exp(-hoursSinceCreation / 24) // 24-hour half-life
}

function calculateEngagementScore(analytics: any): number {
  if (!analytics) return 0

  const likes = analytics.likes || 0
  const comments = analytics.comments || 0
  const reposts = analytics.reposts || 0
  const shares = analytics.shares || 0
  const views = analytics.views || 1

  // Weighted engagement score
  const engagementRate = (likes + comments * 2 + reposts * 3 + shares * 2) / views
  
  return engagementRate * 100
}

async function calculateUserActivityScore(user: any, startDate: Date): Promise<number> {
  // Count user's recent activity
  const [posts, likes, comments, reposts] = await Promise.all([
    prisma.journal.count({
      where: {
        baseUserId: user.id,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.like.count({
      where: {
        userId: user.id,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.comment.count({
      where: {
        baseUserId: user.id,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.repost.count({
      where: {
        baseUserId: user.id,
        dateCreated: { gte: startDate }
      }
    })
  ])

  // Weighted activity score
  return posts * 10 + likes * 1 + comments * 2 + reposts * 3
}
