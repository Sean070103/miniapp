import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/simple-notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Resolve wallet address to BaseUser.id if needed
    let resolvedUserId = userId
    try {
      const baseUser = await prisma.baseUser.findFirst({
        where: {
          OR: [
            { id: userId },
            { walletAddress: userId }
          ]
        },
        select: { id: true }
      })
      if (baseUser?.id) {
        resolvedUserId = baseUser.id
      }
    } catch (_) {
      // Fallback to provided userId if lookup fails
    }

    const notifications = await prisma.simpleNotification.findMany({
      where: {
        receiverId: resolvedUserId
      },
      orderBy: {
        dateCreated: 'desc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({
        ...n,
        dateCreated: n.dateCreated.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/simple-notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, senderId, receiverId, postId, data } = body

    if (!type || !title || !message || !receiverId) {
      return NextResponse.json(
        { success: false, error: 'Type, title, message, and receiverId are required' },
        { status: 400 }
      )
    }

    const notification = await prisma.simpleNotification.create({
      data: {
        type,
        title,
        message,
        senderId,
        receiverId,
        postId,
        data: data ? JSON.stringify(data) : null,
        isRead: false,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        dateCreated: notification.dateCreated.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
