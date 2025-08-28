import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, senderId, postId } = body;

    if (!recipientId || !senderId || !postId) {
      return NextResponse.json(
        { error: 'recipientId, senderId, and postId are required' },
        { status: 400 }
      );
    }

    // Trigger Pusher event for real-time notification
    try {
      await pusherServer.trigger('notifications', 'like', {
        recipientId,
        senderId,
        postId
      });
      
      console.log('Test Pusher event triggered:', { recipientId, senderId, postId });
      
      return NextResponse.json({ 
        success: true,
        message: 'Pusher event triggered successfully',
        data: { recipientId, senderId, postId }
      });
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError);
      return NextResponse.json(
        { error: 'Failed to trigger Pusher event' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test notifications:', error);
    return NextResponse.json(
      { error: 'Failed to process test notification' },
      { status: 500 }
    );
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
