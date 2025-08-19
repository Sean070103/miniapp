import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/moderation - Get moderation reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'resolved', 'dismissed'
    const type = searchParams.get('type') // 'spam', 'inappropriate', 'harassment', 'other'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereClause: any = {}
    if (status) whereClause.status = status
    if (type) whereClause.type = type

    const reports = await prisma.contentReport.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        reportedContent: {
          select: {
            id: true,
            journal: true,
            baseUserId: true,
            dateCreated: true
          }
        }
      },
      orderBy: { dateCreated: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.contentReport.count({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error in Moderation GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/moderation - Report content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reporterId, contentId, contentType, type, reason, details } = body

    if (!reporterId || !contentId || !contentType || !type || !reason) {
      return NextResponse.json(
        { success: false, error: 'Reporter ID, content ID, content type, type, and reason are required' },
        { status: 400 }
      )
    }

    // Check if user already reported this content
    const existingReport = await prisma.contentReport.findFirst({
      where: {
        reporterId,
        contentId,
        contentType
      }
    })

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this content' },
        { status: 400 }
      )
    }

    const report = await prisma.contentReport.create({
      data: {
        reporterId,
        contentId,
        contentType,
        type,
        reason,
        details: details || null,
        status: 'pending'
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    // Auto-moderation for certain types
    if (type === 'spam' || type === 'inappropriate') {
      await autoModerateContent(contentId, contentType, type)
    }

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error('Error in Moderation POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/moderation - Update report status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, status, moderatorId, action, notes } = body

    if (!reportId || !status || !moderatorId) {
      return NextResponse.json(
        { success: false, error: 'Report ID, status, and moderator ID are required' },
        { status: 400 }
      )
    }

    const report = await prisma.contentReport.update({
      where: { id: reportId },
      data: {
        status,
        moderatorId,
        action,
        notes,
        resolvedAt: status === 'resolved' ? new Date() : null
      }
    })

    // Take action on content if resolved
    if (status === 'resolved' && action) {
      await takeModerationAction(report.contentId, report.contentType, action)
    }

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error('Error in Moderation PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function autoModerateContent(contentId: string, contentType: string, type: string) {
  try {
    // Get report count for this content
    const reportCount = await prisma.contentReport.count({
      where: {
        contentId,
        contentType,
        status: 'pending'
      }
    })

    // Auto-flag if multiple reports
    if (reportCount >= 3) {
      if (contentType === 'journal') {
        await prisma.journal.update({
          where: { id: contentId },
          data: { isFlagged: true }
        })
      }
    }
  } catch (error) {
    console.error('Error in auto moderation:', error)
  }
}

async function takeModerationAction(contentId: string, contentType: string, action: string) {
  try {
    switch (action) {
      case 'hide':
        if (contentType === 'journal') {
          await prisma.journal.update({
            where: { id: contentId },
            data: { isHidden: true }
          })
        }
        break
      case 'delete':
        if (contentType === 'journal') {
          await prisma.journal.delete({
            where: { id: contentId }
          })
        }
        break
      case 'warn':
        // Send warning notification to content creator
        break
      default:
        break
    }
  } catch (error) {
    console.error('Error taking moderation action:', error)
  }
}
