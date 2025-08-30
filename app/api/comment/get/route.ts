import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// get comments by journalId
export async function POST(req: Request) {
  try {
    // Check if request has content
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { journalId, cursor, pageSize = 10 } = body as { journalId?: string; cursor?: string; pageSize?: number };

    if (!journalId) {
      return NextResponse.json(
        { error: "Missing journalId" },
        { status: 400 }
      );
    }

    const take = Math.max(1, Math.min(50, Number(pageSize)));
    const where = { journalId } as any;
    const orderBy = { dateCreated: 'desc' } as const;

    const comments = await prisma.comment.findMany({
      where,
      orderBy,
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    const hasMore = comments.length > take;
    const items = hasMore ? comments.slice(0, take) : comments;

    // Batch reply counts per comment
    const ids = items.map(c => c.id);
    const replyCounts = await prisma.chaincomments.groupBy({
      by: ['commentId'],
      _count: { commentId: true },
      where: { commentId: { in: ids } }
    });
    const countsMap = Object.fromEntries(replyCounts.map(rc => [rc.commentId, rc._count.commentId]));

    return NextResponse.json({
      items: items.map(c => ({ ...c, replyCount: countsMap[c.id] || 0 })),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error fetching comments" },
      { status: 500 }
    );
  }
}
