import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/journal - Get all journals or single journal by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid ID format' },
          { status: 400 }
        )
      }

      const journal = await prisma.journal.findUnique({
        where: { id }
      })

      if (!journal) {
        return NextResponse.json(
          { success: false, error: 'Journal not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: journal })
    } else {
      const journals = await prisma.journal.findMany({
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: journals })
    }
  } catch (error) {
    console.error('Error in Journal GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/journal - Create a new journal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUserId, journal, photo, tags, privacy } = body

    // Validate required fields
    if (!baseUserId || !journal) {
      return NextResponse.json(
        { success: false, error: 'baseUserId and journal are required' },
        { status: 400 }
      )
    }

    // Validate privacy setting
    const validPrivacySettings = ['public', 'private', 'friends']
    if (privacy && !validPrivacySettings.includes(privacy)) {
      return NextResponse.json(
        { success: false, error: 'Privacy must be one of: public, private, friends' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.baseUser.findUnique({
      where: { id: baseUserId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const newJournal = await prisma.journal.create({
      data: {
        baseUserId,
        journal,
        photos: photo || null,
        tags: tags || [],
        privacy: privacy || 'public',
        likes: 0,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({ success: true, data: newJournal }, { status: 201 })
  } catch (error) {
    console.error('Error in Journal POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/journal - Update a journal by id
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { journal, photo, tags, privacy } = body

    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id }
    })

    if (!existingJournal) {
      return NextResponse.json(
        { success: false, error: 'Journal not found' },
        { status: 404 }
      )
    }

    // Validate privacy setting if provided
    const validPrivacySettings = ['public', 'private', 'friends']
    if (privacy && !validPrivacySettings.includes(privacy)) {
      return NextResponse.json(
        { success: false, error: 'Privacy must be one of: public, private, friends' },
        { status: 400 }
      )
    }

    const updatedJournal = await prisma.journal.update({
      where: { id },
      data: {
        journal: journal !== undefined ? journal : existingJournal.journal,
        photos: photo !== undefined ? photo : existingJournal.photos,
        tags: tags !== undefined ? tags : existingJournal.tags,
        privacy: privacy !== undefined ? privacy : existingJournal.privacy
      }
    })

    return NextResponse.json({ success: true, data: updatedJournal })
  } catch (error) {
    console.error('Error in Journal PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/journal - Delete a journal by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id }
    })

    if (!existingJournal) {
      return NextResponse.json(
        { success: false, error: 'Journal not found' },
        { status: 404 }
      )
    }

    await prisma.journal.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, data: { message: 'Journal deleted successfully' } })
  } catch (error) {
    console.error('Error in Journal DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
