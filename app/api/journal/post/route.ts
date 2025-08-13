
import prisma from '../../../../utils/connect'
import { NextResponse } from "next/server";

//POST JOURNAL
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseUserId, photo, journal, likes, tags, privacy } = body;

    // ✅ Basic validation
    if (!baseUserId || !journal) {
      return NextResponse.json(
        { error: "Missing required fields: baseUserId or journal" },
        { status: 400 }
      );
    }

    // ✅ Create Journal in DB
    const newJournal = await prisma.journal.create({
      data: {
        baseUserId,
        photo: photo || null,
        journal,
        likes: likes ?? 0,
        tags: Array.isArray(tags) ? tags : [],
        privacy: privacy || "public",
      },
    });

    return NextResponse.json(newJournal, { status: 201 });
  } catch (error) {
    console.error("Error creating journal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}