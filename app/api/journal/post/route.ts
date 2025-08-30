
import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";
import { NotificationService } from '@/lib/notification-service';

//POST JOURNAL
export async function POST(req: Request) {
  try {
    const body = await req.json();
          const { 
        baseUserId, 
        photos, 
        journal, 
        likes, 
        tags, 
        privacy
      } = body;

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
        likes: typeof likes === 'number' ? likes : 0,
        tags: Array.isArray(tags) ? tags : [],
        privacy: privacy || "public",
        archived: false,
        archivedAt: null,
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
            select: { followerId: true }
          });

          // Create notifications for all followers
          for (const follower of followers) {
            await NotificationService.createSystemNotification(
              follower.followerId,
              'New Post',
              `${poster.username || `User_${baseUserId.slice(0, 6)}`} posted something new`,
              { 
                actorId: poster.id, 
                journalId: newJournal.id, 
                action: 'post',
                actorUsername: poster.username,
                postPreview: journal.substring(0, 100) + (journal.length > 100 ? '...' : '')
              }
            );
          }
        }
      } catch (notificationError) {
        console.error('Error creating post notifications:', notificationError);
        // Don't fail the post operation if notification fails
      }
    }

    return NextResponse.json(newJournal, { status: 201 })

  } catch (error) {
    console.error("Error posting journal:", error);
    return NextResponse.json(
      { error: "Failed to post journal" },
      { status: 500 }
    )
  }
}