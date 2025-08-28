import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baseUserId, message, type = 'general' } = body;

    if (!baseUserId || !message) {
      return NextResponse.json(
        { error: 'baseUserId and message are required' },
        { status: 400 }
      );
    }

    // 1. Save notification to DB
    const notification = await prisma.notification.create({
      data: {
        senderId: baseUserId, // Using senderId as userId for simplicity
        receiverId: baseUserId, // Same user for demo
        type: type as any,
        title: 'New Notification',
        message: message,
        data: JSON.stringify({ userId: baseUserId, message, type })
      } as any
    });

    // 2. Create notification data for Pusher
    const notificationData = {
      id: notification.id,
      userId: baseUserId,
      type: type,
      message: message,
      timestamp: new Date().toISOString(),
      createdAt: notification.dateCreated
    };

    // 3. Trigger Pusher event
    try {
      await pusherServer.trigger('notifications', 'new-notification', notificationData);
      
      console.log('Pusher notification event triggered:', notificationData);
      
      return NextResponse.json({ 
        success: true,
        message: 'Notification sent successfully',
        notification: notificationData
      });
    } catch (pusherError) {
      console.error('Error triggering Pusher event:', pusherError);
      return NextResponse.json(
        { error: 'Failed to trigger Pusher event' },
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
