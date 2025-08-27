
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { getPusher } from '@/lib/pusher'

//POST REPOST - Toggle functionality
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { journalId, baseUserId } = body

    console.log('Repost POST request:', { journalId, baseUserId })

    if (!baseUserId || !journalId) {
      return NextResponse.json(
        { error: "Missing required fields: journalId and baseUserId" },
        { status: 400 }
      )
    }

    // Check if journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: journalId }
    })

    console.log('Journal lookup result:', journal ? 'Found' : 'Not found')

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found", journalId },
        { status: 404 }
      )
    }

    // Check if user already reposted this journal
    const existingRepost = await prisma.repost.findFirst({
      where: {
        baseUserId,
        journalId
      }
    })

    if (existingRepost) {
      // Remove repost
      await prisma.repost.delete({
        where: {
          id: existingRepost.id
        }
      })

      return NextResponse.json({ 
        message: "Repost removed successfully",
        reposted: false 
      })
    } else {
      // Create repost
      const createRepost = await prisma.repost.create({
        data: {
          journalId,
          baseUserId,
        }
      })

      // Create notification for the post author (if not reposting your own post)
      if (journal.baseUserId !== baseUserId) {
        try {
          // Get the user who reposted
          const reposter = await prisma.baseUser.findUnique({
            where: { walletAddress: baseUserId },
            select: { id: true, username: true, walletAddress: true }
          });

          // Get the post author
          const postAuthor = await prisma.baseUser.findUnique({
            where: { walletAddress: journal.baseUserId },
            select: { id: true, username: true, walletAddress: true }
          });

          if (reposter && postAuthor) {
            const notification = await prisma.notification.create({
              data: {
                senderId: reposter.id,
                receiverId: postAuthor.id,
                type: 'repost',
                postId: journalId,
                title: 'New Repost',
                message: `${reposter.username || `User_${baseUserId.slice(0, 6)}`} reposted your post`,
                data: JSON.stringify({ 
                  actorId: reposter.id, 
                  journalId, 
                  action: 'repost',
                  actorUsername: reposter.username
                })
              } as any
            });

          // Trigger Pusher event on the "notifications" channel
          const pusher = getPusher();
          if (pusher) {
            try {
              await pusher.trigger(`user-${postAuthor.id}`, 'notification', {
                id: notification.id,
                type: 'repost',
                title: notification.title,
                message: notification.message,
                data: notification.data,
                isRead: notification.isRead,
                dateCreated: notification.dateCreated
              });
              console.log('Pusher event triggered for repost notification');
            } catch (pusherError) {
              console.error('Error triggering Pusher event:', pusherError);
            }
          }
        }

        } catch (notificationError) {
          console.error('Error creating repost notification:', notificationError);
          // Don't fail the repost operation if notification fails
        }
      }

      return NextResponse.json({ 
        message: "Repost created successfully",
        reposted: true,
        repostId: createRepost.id 
      })
    }

  } catch (error) {
    console.error("Error handling repost:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

//GET reposts for a journal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get('journalId');
    const baseUserId = searchParams.get('baseUserId');

    if (!journalId) {
      return NextResponse.json(
        { error: 'Journal ID is required' },
        { status: 400 }
      );
    }

    // Get repost count for the journal
    const repostCount = await prisma.repost.count({
      where: {
        journalId: journalId,
      },
    });

    // Check if user has reposted this journal
    let userReposted = false;
    if (baseUserId) {
      const userRepost = await prisma.repost.findFirst({
        where: {
          journalId: journalId,
          baseUserId: baseUserId,
        },
      });
      userReposted = !!userRepost;
    }

    return NextResponse.json({
      repostCount,
      userReposted,
    });
  } catch (error) {
    console.error('Error fetching reposts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reposts' },
      { status: 500 }
    );
  }
}