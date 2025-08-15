import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { journalId, userId } = await request.json();

    if (!journalId || !userId) {
      return NextResponse.json(
        { error: 'Journal ID and User ID are required' },
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

    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: {
        journalId: journalId,
        userId: userId,
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({ 
        message: 'Post unliked successfully',
        liked: false 
      });
    } else {
      // Like - create new like
      const newLike = await prisma.like.create({
        data: {
          journalId: journalId,
          userId: userId,
        },
      });

      return NextResponse.json({ 
        message: 'Post liked successfully',
        liked: true,
        likeId: newLike.id 
      });
    }
  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json(
      { error: 'Failed to process like' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const journalId = searchParams.get('journalId');
    const userId = searchParams.get('userId');

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

    // Get like count for the journal
    const likeCount = await prisma.like.count({
      where: {
        journalId: journalId,
      },
    });

    // Check if user has liked this journal
    let userLiked = false;
    if (userId) {
      const userLike = await prisma.like.findFirst({
        where: {
          journalId: journalId,
          userId: userId,
        },
      });
      userLiked = !!userLike;
    }

    return NextResponse.json({
      likeCount,
      userLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}
