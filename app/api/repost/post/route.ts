
import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

//POST REPOST - Toggle functionality
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { journalId, baseUserId } = body

    if (!baseUserId || !journalId) {
      return NextResponse.json(
        { error: "Missing required fields: journalId and baseUserId" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.baseUser.findUnique({
      where: { id: baseUserId }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: journalId }
    })

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
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
          dateCreated: new Date()
        }
      })

      return NextResponse.json({ 
        message: "Repost created successfully",
        reposted: true,
        repostId: createRepost.id 
      })
    }

  } catch (error) {
    console.error("Error handling repost:", error)
    return NextResponse.json(
      { error: "Internal server error" },
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