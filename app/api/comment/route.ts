import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/comment - Get all comments or single comment by id
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

      const comment = await prisma.comment.findUnique({
        where: { id }
      })

      if (!comment) {
        return NextResponse.json(
          { success: false, error: 'Comment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: comment })
    } else {
      const comments = await prisma.comment.findMany({
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: comments })
    }
  } catch (error) {
    console.error('Error in Comment GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/comment - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUserId, journalId, comment } = body

    // Validate required fields
    if (!baseUserId || !journalId || !comment) {
      return NextResponse.json(
        { success: false, error: 'baseUserId, journalId, and comment are required' },
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

    const newComment = await prisma.comment.create({
      data: {
        baseUserId,
        journalId,
        comment,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({ success: true, data: newComment }, { status: 201 })
  } catch (error) {
    console.error('Error in Comment POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/comment - Update a comment by id
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
    const { comment } = body

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        comment: comment || existingComment.comment
      }
    })

    return NextResponse.json({ success: true, data: updatedComment })
  } catch (error) {
    console.error('Error in Comment PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/comment - Delete a comment by id
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

    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: 'Comment not found' },
        { status: 404 }
      )
    }

    await prisma.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, data: { message: 'Comment deleted successfully' } })
  } catch (error) {
    console.error('Error in Comment DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
