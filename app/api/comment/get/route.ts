import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// get comments by journalId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { journalId } = body;

    if (!journalId) {
      return NextResponse.json(
        { error: "Missing journalId" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { journalId: journalId },
      include: {
        baseUser: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { dateCreated: 'desc' }
    });

    return NextResponse.json(comments, { status: 200 });

  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error fetching comments" },
      { status: 500 }
    );
  }
}
