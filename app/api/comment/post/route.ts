
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

//POST comment
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { baseUserId, journalId, comment } = body

    if (!baseUserId || !journalId || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: baseUserId, journalId, and comment" },
        { status: 400 }
      )
    }

    // Validate that the journal exists
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      )
    }

    const createComment = await prisma.comment.create({
      data: {
        baseUserId,
        journalId,
        comment,
      }
    })

    // Create notification for the post author (if not commenting on your own post)
    if (journal.baseUserId !== baseUserId) {
      try {
        // Get the user who commented
        const commenter = await prisma.baseUser.findUnique({
          where: { walletAddress: baseUserId },
          select: { username: true, walletAddress: true }
        });

        await prisma.notification.create({
          data: {
            userId: journal.baseUserId,
            type: 'comment',
            title: 'New Comment',
            message: `${commenter?.username || baseUserId.slice(0, 6) + '...' + baseUserId.slice(-4)} commented on your post`,
            data: JSON.stringify({ 
              actorId: baseUserId, 
              journalId, 
              action: 'comment',
              actorUsername: commenter?.username,
              commentText: comment.substring(0, 50) + (comment.length > 50 ? '...' : '')
            })
          }
        });
      } catch (notificationError) {
        console.error('Error creating comment notification:', notificationError);
        // Don't fail the comment operation if notification fails
      }
    }

    return NextResponse.json(createComment, { status: 201 })

  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

//GET comments for a journal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get('journalId');

    if (!journalId) {
      return NextResponse.json(
        { error: 'Journal ID is required' },
        { status: 400 }
      );
    }

    // Validate that the journal exists
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: {
        journalId: journalId,
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}