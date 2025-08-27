import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const journalId = searchParams.get('journalId')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') // 'archive' or 'unarchive'

    if (!journalId || !userId || !action) {
      return NextResponse.json(
        { error: 'Missing journalId, userId, or action' },
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
        { error: 'Unauthorized to archive this post' },
        { status: 403 }
      )
    }

    // Update the journal post archive status
    const updatedJournal = await prisma.journal.update({
      where: { id: journalId },
      data: { 
        archived: action === 'archive' ? true : false,
        archivedAt: action === 'archive' ? new Date() : null
      }
    })

    return NextResponse.json(
      { 
        message: `Post ${action === 'archive' ? 'archived' : 'unarchived'} successfully`,
        archived: updatedJournal.archived
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error archiving journal post:', error)
    return NextResponse.json(
      { error: 'Failed to archive post' },
      { status: 500 }
    )
  }
}

