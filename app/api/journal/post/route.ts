
import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";
import { triggerPusherEvent } from '@/lib/pusher';

//POST JOURNAL
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseUserId, photos, journal, likes, tags, privacy } = body;

    if (!baseUserId || !journal) {
      return NextResponse.json(
        { error: "Missing required fields: baseUserId or journal" },
        { status: 400 }
      );
    }

    const newJournal = await prisma.journal.create({
      data: {
        baseUserId,
        photos: Array.isArray(photos) ? photos : [],
        journal,
        likes: likes ?? 0,
        tags: Array.isArray(tags) ? tags : [],
        privacy: privacy || "public",
      },
    });

    // Notify followers about the new post (only for public posts)
    if (privacy === "public") {
      try {
        // Get the user who posted
        let poster = await prisma.baseUser.findUnique({
          where: { walletAddress: baseUserId },
          select: { id: true, username: true, walletAddress: true }
        });
        
        if (!poster) {
          await prisma.baseUser.create({ data: { walletAddress: baseUserId } });
          poster = await prisma.baseUser.findUnique({
            where: { walletAddress: baseUserId },
            select: { id: true, username: true, walletAddress: true }
          });
        }

        if (poster) {
          // Get all followers of the poster
          const followers = await prisma.follow.findMany({
            where: { followingId: poster.id },
            include: {
              follower: {
                select: { id: true, username: true, walletAddress: true }
              }
            }
          });

          // Create notifications for each follower
          const notifications = await Promise.all(
            followers.map(async (follow) => {
              const notification = await prisma.notification.create({
                data: {
                  senderId: poster.id,
                  receiverId: follow.follower.id,
                  type: 'post',
                  postId: newJournal.id,
                  title: 'New Post',
                  message: `${poster.username || `User_${baseUserId.slice(0, 6)}`} posted something new`,
                  data: JSON.stringify({ 
                    actorId: poster.id, 
                    journalId: newJournal.id, 
                    action: 'post',
                    actorUsername: poster.username,
                    postPreview: journal.substring(0, 100) + (journal.length > 100 ? '...' : '')
                  })
                } as any
              });

              // Trigger Pusher event for real-time notification
              const success = await triggerPusherEvent(
                `user-${follow.follower.walletAddress.toLowerCase()}`,
                'notification',
                {
                  id: notification.id,
                  type: 'post',
                  title: notification.title,
                  message: notification.message,
                  data: notification.data,
                  isRead: notification.isRead,
                  dateCreated: notification.dateCreated
                }
              );
              
              if (!success) {
                console.warn('Failed to trigger Pusher event for post notification');
              }

              return notification;
            })
          );

          console.log(`Created ${notifications.length} notifications for new post`);
        }
      } catch (notificationError) {
        console.error('Error creating post notifications:', notificationError);
        // Don't fail the post creation if notification fails
      }
    }

    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}