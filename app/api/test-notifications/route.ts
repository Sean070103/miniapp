import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToUser } from '@/lib/socket-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, testType = 'test' } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const testNotification = {
      id: `test-${Date.now()}`,
      type: testType,
      title: 'Test Notification',
      message: `This is a test notification sent at ${new Date().toISOString()}`,
      data: JSON.stringify({ test: true, timestamp: Date.now() }),
      isRead: false,
      dateCreated: new Date()
    }

    // Try to send real-time notification
    const socketResult = sendNotificationToUser(userId, testNotification)

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      socketResult,
      notification: testNotification,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in test notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check if Socket.IO is available
    const io = (global as any).io
    const socketStatus = {
      available: !!io,
      connections: io ? Object.keys(io.sockets.sockets).length : 0,
      userRooms: io ? Array.from(io.sockets.adapter.rooms.keys()).filter((room: any) => room.startsWith('user:')) : []
    }

    return NextResponse.json({
      success: true,
      socketStatus,
      environment: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in test notifications GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
