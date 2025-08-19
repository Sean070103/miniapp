import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/analytics/content - Get content analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')
    const contentType = searchParams.get('contentType') || 'journal'

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: 'Content ID is required' },
        { status: 400 }
      )
    }

    let analytics

    if (contentType === 'journal') {
      analytics = await prisma.contentAnalytics.findUnique({
        where: { journalId: contentId },
        include: {
          journal: {
            select: {
              id: true,
              journal: true,
              baseUserId: true,
              dateCreated: true
            }
          }
        }
      })

      if (!analytics) {
        analytics = await prisma.contentAnalytics.create({
          data: {
            journalId: contentId,
            views: 0,
            likes: 0,
            comments: 0,
            reposts: 0,
            shares: 0,
            engagementRate: 0,
            reach: 0
          },
          include: {
            journal: {
              select: {
                id: true,
                journal: true,
                baseUserId: true,
                dateCreated: true
              }
            }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error in Content Analytics GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/analytics/content - Update content analytics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentType, action, data } = body

    if (!contentId || !contentType || !action) {
      return NextResponse.json(
        { success: false, error: 'Content ID, content type, and action are required' },
        { status: 400 }
      )
    }

    let analytics

    if (contentType === 'journal') {
      analytics = await prisma.contentAnalytics.findUnique({
        where: { journalId: contentId }
      })

      if (!analytics) {
        analytics = await prisma.contentAnalytics.create({
          data: {
            journalId: contentId,
            views: 0,
            likes: 0,
            comments: 0,
            reposts: 0,
            shares: 0,
            engagementRate: 0,
            reach: 0
          }
        })
      }

      // Update analytics based on action
      switch (action) {
        case 'view':
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
            data: {
              views: { increment: 1 }
            }
          })
          break

        case 'like':
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
            data: {
              likes: { increment: data.increment || 1 }
            }
          })
          break

        case 'comment':
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
            data: {
              comments: { increment: 1 }
            }
          })
          break

        case 'repost':
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
            data: {
              reposts: { increment: 1 }
            }
          })
          break

        case 'share':
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
            data: {
              shares: { increment: 1 }
            }
          })
          break

        case 'engagement_calculated':
          const engagementRate = calculateContentEngagementRate(analytics)
          analytics = await prisma.contentAnalytics.update({
            where: { journalId: contentId },
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
    }

    return NextResponse.json({ success: true, data: analytics })
  } catch (error) {
    console.error('Error in Content Analytics POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/analytics/content/trending - Get trending content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d' // '1d', '7d', '30d'
    const limit = parseInt(searchParams.get('limit') || '10')

    const now = new Date()
    let startDate: Date

    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    const trendingContent = await prisma.contentAnalytics.findMany({
      where: {
        journal: {
          dateCreated: { gte: startDate }
        }
      },
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
      },
      orderBy: [
        { engagementRate: 'desc' },
        { views: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: trendingContent,
      period
    })
  } catch (error) {
    console.error('Error in Trending Content GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculateContentEngagementRate(analytics: any): number {
  const totalInteractions = analytics.likes + analytics.comments + analytics.reposts + analytics.shares
  const totalViews = analytics.views || 1
  return (totalInteractions / totalViews) * 100
}
