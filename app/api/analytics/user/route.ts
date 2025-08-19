import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics/user - Get user analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || '30d' // '7d', '30d', '90d', '1y'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get or create user analytics
    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: {
          userId,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          totalReposts: 0,
          totalFollowers: 0,
          totalFollowing: 0,
          currentStreak: 0,
          longestStreak: 0,
          engagementRate: 0
        }
      })
    }

    // Calculate period-based analytics
    const periodData = await calculatePeriodAnalytics(userId, period)

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        periodData
      }
    })
  } catch (error) {
    console.error('Error in User Analytics GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/analytics/user - Update user analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, data } = body

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let analytics = await prisma.userAnalytics.findUnique({
      where: { userId }
    })

    if (!analytics) {
      analytics = await prisma.userAnalytics.create({
        data: { userId }
      })
    }

    // Update analytics based on action
    switch (action) {
      case 'post_created':
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            totalPosts: { increment: 1 },
            lastActive: new Date()
          }
        })
        break

      case 'post_liked':
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            totalLikes: { increment: 1 }
          }
        })
        break

      case 'comment_created':
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            totalComments: { increment: 1 }
          }
        })
        break

      case 'repost_created':
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            totalReposts: { increment: 1 }
          }
        })
        break

      case 'streak_updated':
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            currentStreak: data.currentStreak,
            longestStreak: Math.max(analytics.longestStreak, data.currentStreak)
          }
        })
        break

      case 'engagement_calculated':
        const engagementRate = calculateEngagementRate(analytics)
        analytics = await prisma.userAnalytics.update({
          where: { userId },
          data: {
            engagementRate
          }
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Error in User Analytics POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function calculatePeriodAnalytics(userId: string, period: string) {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const [posts, likes, comments, reposts] = await Promise.all([
    prisma.journal.count({
      where: {
        baseUserId: userId,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.like.count({
      where: {
        userId,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.comment.count({
      where: {
        baseUserId: userId,
        dateCreated: { gte: startDate }
      }
    }),
    prisma.repost.count({
      where: {
        baseUserId: userId,
        dateCreated: { gte: startDate }
      }
    })
  ])

  return {
    period,
    posts,
    likes,
    comments,
    reposts,
    totalActivity: posts + likes + comments + reposts
  }
}

function calculateEngagementRate(analytics: any): number {
  const totalInteractions = analytics.totalLikes + analytics.totalComments + analytics.totalReposts
  const totalPosts = analytics.totalPosts || 1
  return totalInteractions / totalPosts
}
