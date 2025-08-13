import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/baseuser - Get all users or single user by id
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

      const user = await prisma.baseUser.findUnique({
        where: { id }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, data: user })
    } else {
      const users = await prisma.baseUser.findMany({
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: users })
    }
  } catch (error) {
    console.error('Error in BaseUser GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/baseuser - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, username, email, profilePicture, bio } = body

    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'walletAddress is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.baseUser.findFirst({
      where: { walletAddress }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this wallet address already exists' },
        { status: 400 }
      )
    }

    const newUser = await prisma.baseUser.create({
      data: {
        walletAddress,
        username: username || null,
        email: email || null,
        profilePicture: profilePicture || null,
        bio: bio || null,
        dateCreated: new Date()
      }
    })

    return NextResponse.json({ success: true, data: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error in BaseUser POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/baseuser - Update a user by id
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
    const { username, email, profilePicture, bio } = body

    // Check if user exists
    const existingUser = await prisma.baseUser.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.baseUser.update({
      where: { id },
      data: {
        username: username !== undefined ? username : existingUser.username,
        email: email !== undefined ? email : existingUser.email,
        profilePicture: profilePicture !== undefined ? profilePicture : existingUser.profilePicture,
        bio: bio !== undefined ? bio : existingUser.bio
      }
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error in BaseUser PUT:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/baseuser - Delete a user by id
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

    // Check if user exists
    const existingUser = await prisma.baseUser.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.baseUser.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, data: { message: 'User deleted successfully' } })
  } catch (error) {
    console.error('Error in BaseUser DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
