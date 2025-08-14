

import prisma from "@/utils/connect" 
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { journalId } = await req.json()

    if (!journalId) {
      return NextResponse.json(
        { error: "Journal ID is required" },
        { status: 400 }
      )
    }

    // Increment the like count by 1
    const updatedJournal = await prisma.journal.update({
      where: { id: journalId },
      data: {
        likes: { increment: 1 }
      }
    })

    return NextResponse.json(
      { message: "Journal liked successfully", journal: updatedJournal },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error liking journal:", error)
    return NextResponse.json(
      { error: "Failed to like journal" },
      { status: 500 }
    )
  }
}
