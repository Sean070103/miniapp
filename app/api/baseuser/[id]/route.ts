import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { username, email, bio, profilePicture } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await prisma.baseUser.findFirst({
        where: {
          username: username.toLowerCase(),
          id: { not: id }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.baseUser.update({
      where: { id },
      data: {
        username: username?.toLowerCase(),
        email,
        bio,
        profilePicture
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        profilePicture: true,
        bio: true,
        dateCreated: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
