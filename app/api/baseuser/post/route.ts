import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { walletAddress, username, email, profilePicture, bio } = body

  try {
    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.baseUser.findUnique({
      where: { walletAddress },
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          message: "User already exists", 
          user: {
            id: existingUser.id,
            walletAddress: existingUser.walletAddress,
            username: existingUser.username
          } 
        },
        { status: 200 }
      )
    }

    // Create new user
    const newUser = await prisma.baseUser.create({
      data: { 
        walletAddress,
        username,
        email,
        profilePicture,
        bio
      },
    })

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          walletAddress: newUser.walletAddress,
          username: newUser.username
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in user creation:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
