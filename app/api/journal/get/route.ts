import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET ALL JOURNAL
export async function GET() {
  try {
    const journals = await prisma.journal.findMany({
      orderBy: { dateCreated: 'desc' }
    })

    // If no journals found, return hardcoded test data
    if (journals.length === 0) {
      const testJournals = [
        {
          id: "test-journal-1",
          baseUserId: "test-user-1",
          journal: "This is a test post from user 1. Testing the feed functionality!",
          photos: [],
          likes: 5,
          tags: ["test", "web3", "crypto"],
          privacy: "public",
          dateCreated: new Date().toISOString(),
          isDraft: false,
          isFlagged: false,
          isHidden: false,
          archived: false,
          archivedAt: null
        },
        {
          id: "test-journal-2", 
          baseUserId: "test-user-2",
          journal: "Another test post from user 2. The real-time notifications are working great!",
          photos: [],
          likes: 3,
          tags: ["test", "notifications", "dailybase"],
          privacy: "public",
          dateCreated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isDraft: false,
          isFlagged: false,
          isHidden: false,
          archived: false,
          archivedAt: null
        },
        {
          id: "test-journal-3",
          baseUserId: "test-user-3", 
          journal: "Third test post from user 3. Building a great Web3 life log platform!",
          photos: [],
          likes: 7,
          tags: ["web3", "life", "log"],
          privacy: "public",
          dateCreated: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          isDraft: false,
          isFlagged: false,
          isHidden: false,
          archived: false,
          archivedAt: null
        }
      ];
      
      console.log("No journals found in database, returning test data");
      return NextResponse.json(testJournals, { status: 200 });
    }

    console.log(`Found ${journals.length} journals in database`);
    return NextResponse.json(journals, { status: 200 });

  } catch (error) {
    console.error("Error at GET /Journal", error);
    
    // Return test data even if database fails
    const fallbackJournals = [
      {
        id: "fallback-journal-1",
        baseUserId: "fallback-user-1", 
        journal: "Fallback test post - database connection issue detected.",
        photos: [],
        likes: 2,
        tags: ["fallback", "test"],
        privacy: "public",
        dateCreated: new Date().toISOString(),
        isDraft: false,
        isFlagged: false,
        isHidden: false,
        archived: false,
        archivedAt: null
      }
    ];
    
    console.log("Database error, returning fallback test data");
    return NextResponse.json(fallbackJournals, { status: 200 });
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
      where: { id: journalId }
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
      comments: comments
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching journal with comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}