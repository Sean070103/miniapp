import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";


// get chain comments by commentId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: "Missing commentId" },
        { status: 400 }
      );
    }

    const chainComments = await prisma.chaincomments.findMany({
      where: { commentId: commentId },
      orderBy: { dateCreated: 'asc' },
    });

    return NextResponse.json(chainComments, { status: 200 });

  } catch (error) {
    console.error("Error fetching chain comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch chain comments" },
      { status: 500 }
    );
  }
}
