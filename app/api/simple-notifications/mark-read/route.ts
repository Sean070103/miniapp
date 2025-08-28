import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/simple-notifications/mark-read - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationIds } = body

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

    if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await prisma.simpleNotification.updateMany({
        where: {
          id: { in: notificationIds },
          receiverId: resolvedUserId
        },
        data: {
          isRead: true
        }
      })
    } else {
      // Mark all notifications for user as read
      await prisma.simpleNotification.updateMany({
        where: {
          receiverId: resolvedUserId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}
