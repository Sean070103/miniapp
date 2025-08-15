import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// get reposts by baseUserId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseUserId } = body;

    if (!baseUserId) {
      return NextResponse.json(
        { error: "Missing baseUserId" },
        { status: 400 }
      );
    }

    const userReposts = await prisma.repost.findMany({
      where: { baseUserId: baseUserId },
      include: {
        journal: true
      },
      orderBy: { dateCreated: 'desc' }
    });

    return NextResponse.json(userReposts, { status: 200 });

  } catch (error) {
    console.error("Error fetching user reposts:", error);
    return NextResponse.json(
      { error: "Error fetching user reposts" },
      { status: 500 }
    );
  }
}
