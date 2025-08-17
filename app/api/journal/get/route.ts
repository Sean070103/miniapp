import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET ALL JOURNAL
export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { dateCreated: 'desc' }
    })

    return NextResponse.json(journals, { status: 200 });

  } catch (error) {
    console.error("Error at GET /Journal", error);
    return NextResponse.json(
      { error: "Failed to get journals" },
      { status: 500 }
    );
  }
}

// POST - Get journal with comments
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

    const journal = await prisma.journal.findUnique({
<<<<<<< HEAD
      where: { id: journalId }
=======
      where: { id: journalId },
>>>>>>> e872be97757440d14dc31091e4478d9d999e29d5
    });

    if (!journal) {
      return NextResponse.json(
        { error: "Journal not found" },
        { status: 404 }
      );
    }

    // Fetch comments separately
    const comments = await prisma.comment.findMany({
      where: { journalId: journalId },
      orderBy: { dateCreated: 'desc' }
    });

    return NextResponse.json({ 
      journal,
<<<<<<< HEAD
      comments: comments
=======
>>>>>>> e872be97757440d14dc31091e4478d9d999e29d5
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching journal with comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}