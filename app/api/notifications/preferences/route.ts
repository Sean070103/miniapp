import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/notifications/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user preferences from database
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId }
    })

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: {
          userId,
          likes: true,
          comments: true,
          reposts: true,
          follows: true,
          mentions: true,
          emailDigest: false,
          pushNotifications: true,
          quietHours: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00'
        }
      })
    }

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Error in Notification Preferences GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/preferences - Update user notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId || !preferences) {
      return NextResponse.json(
        { success: false, error: 'User ID and preferences are required' },
        { status: 400 }
      )
    }

    // Upsert preferences (create if doesn't exist, update if it does)
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    })

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    })
  } catch (error) {
    console.error('Error in Notification Preferences POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

