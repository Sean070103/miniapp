import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toDateKey(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const tz = searchParams.get('tz') || 'UTC'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required (wallet address or BaseUser.id)' },
        { status: 400 }
      )
    }

    // Journal.baseUserId stores walletAddress. Accept either BaseUser.id or walletAddress and resolve to walletAddress.
    let walletAddress = userId
    try {
      const baseUser = await prisma.baseUser.findFirst({
        where: {
          OR: [
            { walletAddress: userId },
            { id: userId }
          ]
        },
        select: { walletAddress: true }
      })
      if (baseUser?.walletAddress) walletAddress = baseUser.walletAddress
    } catch {}

    const journals = await prisma.journal.findMany({
      where: { baseUserId: walletAddress },
      select: { dateCreated: true },
      orderBy: { dateCreated: 'desc' }
    })

    const dates = Array.from(new Set(journals.map(j => {
      const dt = new Date(j.dateCreated)
      return dt.toLocaleString('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    })))

    return NextResponse.json({ success: true, userId: walletAddress, dates })
  } catch (error) {
    console.error('Error fetching calendar dates:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dates' }, { status: 500 })
  }
}


