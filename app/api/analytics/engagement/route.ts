import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics/engagement - Get engagement reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const contentId = searchParams.get('contentId')
    const period = searchParams.get('period') || '30d'
    const type = searchParams.get('type') || 'user' // 'user', 'content', 'overall'

    if (!userId && !contentId) {
      return NextResponse.json(
        { success: false, error: 'User ID or Content ID is required' },
        { status: 400 }
      )
    }

    let report

    switch (type) {
      case 'user':
        if (!userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required for user reports' },
            { status: 400 }
          )
        }
        report = await generateUserEngagementReport(userId, period)
        break
      case 'content':
        if (!contentId) {
          return NextResponse.json(
            { success: false, error: 'Content ID is required for content reports' },
            { status: 400 }
          )
        }
        report = await generateContentEngagementReport(contentId, period)
        break
      case 'overall':
        report = await generateOverallEngagementReport(period)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: report,
      type,
      period
    })
  } catch (error) {
    console.error('Error in Engagement Reports GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateUserEngagementReport(userId: string, period: string) {
  const { startDate, endDate } = getDateRange(period)

  // Get user's posts
  const posts = await prisma.journal.findMany({
    where: {
      baseUserId: userId,
      dateCreated: { gte: startDate, lte: endDate }
    },
    include: {
      contentAnalytics: true
    }
  })

  // Calculate engagement metrics
  const totalPosts = posts.length
  const totalLikes = posts.reduce((sum, post) => sum + (post.contentAnalytics?.likes || 0), 0)
  const totalComments = posts.reduce((sum, post) => sum + (post.contentAnalytics?.comments || 0), 0)
  const totalReposts = posts.reduce((sum, post) => sum + (post.contentAnalytics?.reposts || 0), 0)
  const totalViews = posts.reduce((sum, post) => sum + (post.contentAnalytics?.views || 0), 0)
  const totalShares = posts.reduce((sum, post) => sum + (post.contentAnalytics?.shares || 0), 0)

  // Calculate engagement rates
  const avgEngagementRate = totalPosts > 0 ? (totalLikes + totalComments + totalReposts) / totalPosts : 0
  const viewToEngagementRate = totalViews > 0 ? (totalLikes + totalComments + totalReposts) / totalViews : 0

  // Get engagement over time
  const engagementOverTime = await getEngagementOverTime(userId, startDate, endDate)

  // Get top performing posts
  const topPosts = posts
    .map(post => ({
      id: post.id,
      content: post.journal.substring(0, 100) + '...',
      likes: post.contentAnalytics?.likes || 0,
      comments: post.contentAnalytics?.comments || 0,
      reposts: post.contentAnalytics?.reposts || 0,
      views: post.contentAnalytics?.views || 0,
      engagementRate: post.contentAnalytics?.engagementRate || 0,
      dateCreated: post.dateCreated
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5)

  return {
    summary: {
      totalPosts,
      totalLikes,
      totalComments,
      totalReposts,
      totalViews,
      totalShares,
      avgEngagementRate,
      viewToEngagementRate
    },
    engagementOverTime,
    topPosts,
    period: {
      start: startDate,
      end: endDate
    }
  }
}

async function generateContentEngagementReport(contentId: string, period: string) {
  const { startDate, endDate } = getDateRange(period)

  // Get content analytics
  const analytics = await prisma.contentAnalytics.findUnique({
    where: { journalId: contentId },
    include: {
      journal: {
        select: {
          id: true,
          journal: true,
          baseUserId: true,
          dateCreated: true,
          tags: true
        }
      }
    }
  })

  if (!analytics) {
    return {
      error: 'Content not found'
    }
  }

  // Get engagement over time for this content
  const engagementOverTime = await getContentEngagementOverTime(contentId, startDate, endDate)

  // Get similar content performance
  const similarContent = await getSimilarContentPerformance(analytics.journal.tags, contentId)

  return {
    content: analytics.journal,
    analytics: {
      views: analytics.views,
      likes: analytics.likes,
      comments: analytics.comments,
      reposts: analytics.reposts,
      shares: analytics.shares,
      engagementRate: analytics.engagementRate,
      reach: analytics.reach
    },
    engagementOverTime,
    similarContent,
    period: {
      start: startDate,
      end: endDate
    }
  }
}

async function generateOverallEngagementReport(period: string) {
  const { startDate, endDate } = getDateRange(period)

  // Get overall platform metrics
  const [totalPosts, totalLikes, totalComments, totalReposts, totalViews] = await Promise.all([
    prisma.journal.count({
      where: {
        dateCreated: { gte: startDate, lte: endDate },
        privacy: 'public'
      }
    }),
    prisma.like.count({
      where: {
        dateCreated: { gte: startDate, lte: endDate }
      }
    }),
    prisma.comment.count({
      where: {
        dateCreated: { gte: startDate, lte: endDate }
      }
    }),
    prisma.repost.count({
      where: {
        dateCreated: { gte: startDate, lte: endDate }
      }
    }),
    prisma.contentAnalytics.aggregate({
      where: {
        journal: {
          dateCreated: { gte: startDate, lte: endDate }
        }
      },
      _sum: {
        views: true
      }
    })
  ])

  const totalViews = totalViews._sum.views || 0
  const avgEngagementRate = totalPosts > 0 ? (totalLikes + totalComments + totalReposts) / totalPosts : 0

  // Get trending topics
  const trendingTopics = await getTrendingTopics(startDate, endDate)

  // Get top performing users
  const topUsers = await getTopPerformingUsers(startDate, endDate)

  return {
    summary: {
      totalPosts,
      totalLikes,
      totalComments,
      totalReposts,
      totalViews,
      avgEngagementRate
    },
    trendingTopics,
    topUsers,
    period: {
      start: startDate,
      end: endDate
    }
  }
}

function getDateRange(period: string) {
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

  return { startDate, endDate: now }
}

async function getEngagementOverTime(userId: string, startDate: Date, endDate: Date) {
  // Get daily engagement data
  const posts = await prisma.journal.findMany({
    where: {
      baseUserId: userId,
      dateCreated: { gte: startDate, lte: endDate }
    },
    include: {
      contentAnalytics: true
    },
    orderBy: { dateCreated: 'asc' }
  })

  // Group by date
  const dailyData: { [key: string]: any } = {}
  
  posts.forEach(post => {
    const date = post.dateCreated.toISOString().split('T')[0]
    if (!dailyData[date]) {
      dailyData[date] = {
        posts: 0,
        likes: 0,
        comments: 0,
        reposts: 0,
        views: 0
      }
    }
    
    dailyData[date].posts += 1
    dailyData[date].likes += post.contentAnalytics?.likes || 0
    dailyData[date].comments += post.contentAnalytics?.comments || 0
    dailyData[date].reposts += post.contentAnalytics?.reposts || 0
    dailyData[date].views += post.contentAnalytics?.views || 0
  })

  return Object.entries(dailyData).map(([date, data]) => ({
    date,
    ...data
  }))
}

async function getContentEngagementOverTime(contentId: string, startDate: Date, endDate: Date) {
  // This would typically track engagement over time for specific content
  // For now, return a simple structure
  return {
    contentId,
    period: { start: startDate, end: endDate },
    data: []
  }
}

async function getSimilarContentPerformance(tags: string[], excludeId: string) {
  // Get content with similar tags
  const similarContent = await prisma.journal.findMany({
    where: {
      tags: { hasSome: tags },
      id: { not: excludeId },
      privacy: 'public'
    },
    include: {
      contentAnalytics: true
    },
    take: 5
  })

  return similarContent.map(content => ({
    id: content.id,
    content: content.journal.substring(0, 100) + '...',
    engagementRate: content.contentAnalytics?.engagementRate || 0,
    likes: content.contentAnalytics?.likes || 0,
    comments: content.contentAnalytics?.comments || 0
  }))
}

async function getTrendingTopics(startDate: Date, endDate: Date) {
  // Get all posts in the period
  const posts = await prisma.journal.findMany({
    where: {
      dateCreated: { gte: startDate, lte: endDate },
      privacy: 'public'
    },
    select: {
      tags: true,
      contentAnalytics: true
    }
  })

  // Count tag occurrences
  const tagCounts: { [key: string]: number } = {}
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))
}

async function getTopPerformingUsers(startDate: Date, endDate: Date) {
  // Get users with highest engagement
  const users = await prisma.baseUser.findMany({
    include: {
      userAnalytics: true,
      _count: {
        select: {
          followers: true
        }
      }
    }
  })

  return users
    .filter(user => user.userAnalytics)
    .map(user => ({
      id: user.id,
      username: user.username,
      followers: user._count.followers,
      engagementRate: user.userAnalytics?.engagementRate || 0,
      totalPosts: user.userAnalytics?.totalPosts || 0
    }))
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 10)
}
