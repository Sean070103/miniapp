import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/chaincomment - Get all chain comments or single chain comment by id
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

      const chainComment = await prisma.chaincomments.findUnique({
        where: { id }
      })

      if (!chainComment) {
        return NextResponse.json(
          { success: false, error: 'Chain comment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: chainComment })
    } else {
      const chainComments = await prisma.chaincomments.findMany({
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: chainComments })
    }
  } catch (error) {
    console.error('Error in ChainComment GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/chaincomment - Create a new chain comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { baseUserId, commentId, chainComment } = body

    // Validate required fields
    if (!baseUserId || !commentId || !chainComment) {
      return NextResponse.json(
        { success: false, error: 'baseUserId, commentId, and chainComment are required' },
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

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!parentComment) {
      return NextResponse.json(
        { success: false, error: 'Parent comment not found' },
        { status: 404 }
      )
    }

    const newChainComment = await prisma.chaincomments.create({
      data: {
        baseUserId,
        commentId,
        chainComment,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({ success: true, data: newChainComment }, { status: 201 })
  } catch (error) {
    console.error('Error in ChainComment POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/chaincomment - Update a chain comment by id
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
    const { chainComment } = body

    // Check if chain comment exists
    const existingChainComment = await prisma.chaincomments.findUnique({
      where: { id }
    })

    if (!existingChainComment) {
      return NextResponse.json(
        { success: false, error: 'Chain comment not found' },
        { status: 404 }
      )
    }

    const updatedChainComment = await prisma.chaincomments.update({
      where: { id },
      data: {
        chainComment: chainComment || existingChainComment.chainComment
      }
    })

    return NextResponse.json({ success: true, data: updatedChainComment })
  } catch (error) {
    console.error('Error in ChainComment PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/chaincomment - Delete a chain comment by id
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

    // Check if chain comment exists
    const existingChainComment = await prisma.chaincomments.findUnique({
      where: { id }
    })

    if (!existingChainComment) {
      return NextResponse.json(
        { success: false, error: 'Chain comment not found' },
        { status: 404 }
      )
    }

    await prisma.chaincomments.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, data: { message: 'Chain comment deleted successfully' } })
  } catch (error) {
    console.error('Error in ChainComment DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
