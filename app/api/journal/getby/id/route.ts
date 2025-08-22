import prisma from '@/utils/connect'
import { NextResponse } from 'next/server'


// get post by baseUserId
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

    const baseUserJournal = await prisma.journal.findMany({
      where: { baseUserId: baseUserId },
      orderBy: { dateCreated: 'desc' }
    });

    return NextResponse.json(baseUserJournal, { status: 200 });

  } catch (error) {
    console.error("Error fetching base user journal:", error);
    return NextResponse.json(
      { error: "Error fetching base user journal" },
      { status: 500 }
    );
  }
}
