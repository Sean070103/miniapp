import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_PREFERENCES } from '@/lib/simple-notifications'

// GET /api/simple-notifications/preferences - Get user notification preferences
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

    let preferences = await prisma.simpleNotificationPreferences.findUnique({
      where: { userId }
    })

    if (!preferences) {
      // Create default preferences if none exist
      preferences = await prisma.simpleNotificationPreferences.create({
        data: {
          userId,
          ...DEFAULT_PREFERENCES
        }
      })
    }

    return NextResponse.json({
      success: true,
      preferences
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// POST /api/simple-notifications/preferences - Update user notification preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const updatedPreferences = await prisma.simpleNotificationPreferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...DEFAULT_PREFERENCES,
        ...preferences
      }
    })

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
