import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/drafts - Get user drafts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const drafts = await prisma.draft.findMany({
      where: { userId },
      orderBy: { lastSaved: 'desc' },
      take: limit,
      skip: offset
    })

    const totalCount = await prisma.draft.count({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      data: drafts,
      pagination: {
        total: totalCount,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error in Drafts GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/drafts - Create or update draft
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, content, tags, photos, privacy, draftId } = body

    if (!userId || !content) {
      return NextResponse.json(
        { success: false, error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    let draft

    if (draftId) {
      // Update existing draft
      draft = await prisma.draft.update({
        where: { id: draftId },
        data: {
          title: title || null,
          content,
          tags: tags || [],
          photos: photos || [],
          privacy: privacy || 'public',
          lastSaved: new Date()
        }
      })
    } else {
      // Create new draft
      draft = await prisma.draft.create({
        data: {
          userId,
          title: title || null,
          content,
          tags: tags || [],
          photos: photos || [],
          privacy: privacy || 'public'
        }
      })
    }

    return NextResponse.json({ success: true, data: draft })
  } catch (error) {
    console.error('Error in Drafts POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/drafts - Update draft
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftId, title, content, tags, photos, privacy } = body

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    const draft = await prisma.draft.update({
      where: { id: draftId },
      data: {
        title: title || null,
        content,
        tags: tags || [],
        photos: photos || [],
        privacy: privacy || 'public',
        lastSaved: new Date()
      }
    })

    return NextResponse.json({ success: true, data: draft })
  } catch (error) {
    console.error('Error in Drafts PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/drafts - Delete draft
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const draftId = searchParams.get('draftId')

    if (!draftId) {
      return NextResponse.json(
        { success: false, error: 'Draft ID is required' },
        { status: 400 }
      )
    }

    await prisma.draft.delete({
      where: { id: draftId }
    })

    return NextResponse.json({ success: true, message: 'Draft deleted successfully' })
  } catch (error) {
    console.error('Error in Drafts DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
