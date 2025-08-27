import { NextRequest, NextResponse } from 'next/server'
import { Liveblocks } from '@liveblocks/node'

const secret = process.env.LIVEBLOCKS_SECRET_KEY

const liveblocks = secret
  ? new Liveblocks({ secret })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!liveblocks) {
      return NextResponse.json({ error: 'Liveblocks not configured' }, { status: 500 })
    }

    // Identify the current user; adapt to your auth
    const { userId } = await request.json().catch(() => ({ userId: undefined }))
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Authorize into a user-specific room (notifications)
    const room = `user-${userId}`
    const session = await liveblocks.prepareSession(`user:${userId}`, {
      userInfo: { id: userId },
    })
    session.allow(room, session.FULL_ACCESS)
    const { body, status } = await session.authorize()
    return new NextResponse(body, { status, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    console.error('Liveblocks auth error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


