import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/repost - Get all reposts or single repost by id
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

      const repost = await prisma.repost.findUnique({
        where: { id }
      })

      if (!repost) {
        return NextResponse.json(
          { success: false, error: 'Repost not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: repost })
    } else {
      const reposts = await prisma.repost.findMany({
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: reposts })
    }
  } catch (error) {
    console.error('Error in Repost GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/repost - Create a new repost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUserId, journalId } = body

    // Validate required fields
    if (!baseUserId || !journalId) {
      return NextResponse.json(
        { success: false, error: 'baseUserId and journalId are required' },
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

    // Check if journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: journalId }
    })

    if (!journal) {
      return NextResponse.json(
        { success: false, error: 'Journal not found' },
        { status: 404 }
      )
    }

    // Check if user already reposted this journal
    const existingRepost = await prisma.repost.findFirst({
      where: {
        baseUserId,
        journalId
      }
    })

    if (existingRepost) {
      return NextResponse.json(
        { success: false, error: 'User has already reposted this journal' },
        { status: 400 }
      )
    }

    const newRepost = await prisma.repost.create({
      data: {
        baseUserId,
        journalId,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({ success: true, data: newRepost }, { status: 201 })
  } catch (error) {
    console.error('Error in Repost POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/repost - Update a repost by id
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
    const { baseUserId, journalId } = body

    // Check if repost exists
    const existingRepost = await prisma.repost.findUnique({
      where: { id }
    })

    if (!existingRepost) {
      return NextResponse.json(
        { success: false, error: 'Repost not found' },
        { status: 404 }
      )
    }

    // Validate new user and journal if provided
    if (baseUserId) {
      const user = await prisma.baseUser.findUnique({
        where: { id: baseUserId }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
    }

    if (journalId) {
      const journal = await prisma.journal.findUnique({
        where: { id: journalId }
      })

      if (!journal) {
        return NextResponse.json(
          { success: false, error: 'Journal not found' },
          { status: 404 }
        )
      }
    }

    const updatedRepost = await prisma.repost.update({
      where: { id },
      data: {
        baseUserId: baseUserId || existingRepost.baseUserId,
        journalId: journalId || existingRepost.journalId
      }
    })

    return NextResponse.json({ success: true, data: updatedRepost })
  } catch (error) {
    console.error('Error in Repost PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/repost - Delete a repost by id
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

    // Check if repost exists
    const existingRepost = await prisma.repost.findUnique({
      where: { id }
    })

    if (!existingRepost) {
      return NextResponse.json(
        { success: false, error: 'Repost not found' },
        { status: 404 }
      )
    }

    await prisma.repost.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, data: { message: 'Repost deleted successfully' } })
  } catch (error) {
    console.error('Error in Repost DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
