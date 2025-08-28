import { NextRequest, NextResponse } from 'next/server';
import { getPusher } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUserId, message } = body;

    if (!baseUserId || !message) {
      return NextResponse.json(
        { error: 'baseUserId and message are required' },
        { status: 400 }
      );
    }

    // Create notification data
    const notificationData = {
      userId: baseUserId,
      message,
      timestamp: new Date().toISOString(),
      id: Date.now().toString() // Simple ID for demo
    };

    // Trigger Pusher event on the "notifications" channel
    const pusher = getPusher();
    if (pusher) {
      try {
        await pusher.trigger('notifications', 'new-notification', notificationData);
        
        console.log('Pusher notification event triggered:', notificationData);
        
        return NextResponse.json({ 
          success: true,
          message: 'Notification sent successfully',
          data: notificationData
        });
      } catch (pusherError) {
        console.error('Error triggering Pusher event:', pusherError);
        return NextResponse.json(
          { error: 'Failed to trigger Pusher event' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Pusher not configured' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in notify API:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
