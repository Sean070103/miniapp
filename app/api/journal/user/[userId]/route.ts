import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const journals = await prisma.journal.findMany({
      where: { baseUserId: userId },
      orderBy: { dateCreated: 'desc' },
      select: {
        id: true,
        journal: true,
        photos: true,
        tags: true,
        privacy: true,
        dateCreated: true,
        likes: true
      }
    })

    return NextResponse.json({
      journals,
      total: journals.length
    })
  } catch (error) {
    console.error('Error fetching user journals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
