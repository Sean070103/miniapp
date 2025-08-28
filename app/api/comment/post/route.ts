
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

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
        let commenter = await prisma.baseUser.findUnique({
          where: { walletAddress: baseUserId },
          select: { id: true, username: true, walletAddress: true }
        });
        if (!commenter) {
          await prisma.baseUser.create({ data: { walletAddress: baseUserId } });
          commenter = await prisma.baseUser.findUnique({
            where: { walletAddress: baseUserId },
            select: { id: true, username: true, walletAddress: true }
          });
        }

        // Get the post author
        let postAuthor = await prisma.baseUser.findUnique({
          where: { walletAddress: journal.baseUserId },
          select: { id: true, username: true, walletAddress: true }
        });
        if (!postAuthor) {
          await prisma.baseUser.create({ data: { walletAddress: journal.baseUserId } });
          postAuthor = await prisma.baseUser.findUnique({
            where: { walletAddress: journal.baseUserId },
            select: { id: true, username: true, walletAddress: true }
          });
        }

        if (commenter && postAuthor) {
          await NotificationService.createCommentNotification(
            commenter.id,
            postAuthor.id,
            journalId,
            commenter.username || `User_${baseUserId.slice(0, 6)}`
          );
          console.log('Simple notification created for comment');
        }

      } catch (notificationError) {
        console.error('Error creating comment notification:', notificationError);
        // Don't fail the comment operation if notification fails
      }
    }

    return NextResponse.json(createComment, { status: 201 })

  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
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