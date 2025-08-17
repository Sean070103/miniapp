import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      )
    }

    // Check if username exists
    const existingUser = await prisma.baseUser.findFirst({
      where: { username: username.toLowerCase() },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingUser,
      username: username
    })
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
