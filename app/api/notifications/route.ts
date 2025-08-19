import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const whereClause = {
      userId,
      ...(unreadOnly && { isRead: false })
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { dateCreated: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.notification.count({
      where: { userId }
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total: totalCount,
        unread: unreadCount,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error in Notifications GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, data } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'User ID, type, title, and message are required' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    })

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error in Notifications POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationIds } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId
        },
        data: { isRead: true }
      })
    } else {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read' })
  } catch (error) {
    console.error('Error in Notifications PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const notificationId = searchParams.get('notificationId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (notificationId) {
      // Delete specific notification
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId
        }
      })
    } else {
      // Delete all read notifications
      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Notifications deleted' })
  } catch (error) {
    console.error('Error in Notifications DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
