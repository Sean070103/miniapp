import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First get all reposts by the user
    const reposts = await prisma.repost.findMany({
      where: { baseUserId: userId },
      orderBy: { dateCreated: 'desc' },
      select: {
        journalId: true,
        dateCreated: true
      }
    })

    // Then fetch the actual journals for those reposts
    const journalIds = reposts.map(repost => repost.journalId)
    const journals = await prisma.journal.findMany({
      where: {
        id: { in: journalIds }
      },
      select: {
        id: true,
        journal: true,
        photos: true,
        tags: true,
        privacy: true,
        dateCreated: true,
        likes: true
      },
      orderBy: { dateCreated: 'desc' }
    })

    return NextResponse.json({
      reposts: journals,
      total: reposts.length
    })
  } catch (error) {
    console.error('Error fetching user reposts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
