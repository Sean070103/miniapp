
import { prisma } from '@/lib/prisma'
import { NextResponse } from "next/server";

//POST comment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId, baseUserId, chainComment } = body;

    if (!baseUserId || !commentId || !chainComment) {
      return NextResponse.json(
        { error: "Missing required fields: baseUserId, commentId, or chainComment" },
        { status: 400 }
      );
    }

    const createChainComment = await prisma.chaincomments.create({
      data: {
        commentId,
        baseUserId,
        chainComment,
        dateCreated: new Date(),
      }
    });

    return NextResponse.json(createChainComment, { status: 201 });

  } catch (error) {
    console.error("Error creating chain comment:", error);
    return NextResponse.json(
      { error: "Failed to create chain comment" },
      { status: 500 }
    );
  }
}