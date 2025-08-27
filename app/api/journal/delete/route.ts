import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get('journalId')
    const userId = searchParams.get('userId')

    if (!journalId || !userId) {
      return NextResponse.json(
        { error: 'Missing journalId or userId' },
        { status: 400 }
      )
    }

    // Check if the user owns the post
    const journal = await prisma.journal.findUnique({
      where: { id: journalId }
    })

    if (!journal) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (journal.baseUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this post' },
        { status: 403 }
      )
    }

    // Delete the journal post
    await prisma.journal.delete({
      where: { id: journalId }
    })

    return NextResponse.json(
      { message: 'Post deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting journal post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

