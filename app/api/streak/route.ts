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

    // Build a set of YYYY-MM-DD keys
    const dateKeys = new Set<string>()
    for (const j of journals) {
      dateKeys.add(toDateKey(new Date(j.dateCreated)))
    }

    // Compute current and longest streaks (UTC-based)
    const today = new Date()
    let currentStreak = 0
    let longestStreak = 0

    // Walk backwards from today while dates exist
    let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    while (dateKeys.has(toDateKey(cursor))) {
      currentStreak += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    // Compute longest by scanning all dates
    // Convert to sorted array of timestamps (UTC midnight)
    const sorted = Array.from(dateKeys)
      .map(k => new Date(k + 'T00:00:00.000Z').getTime())
      .sort((a, b) => a - b)

    let streak = 0
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) {
        streak = 1
        longestStreak = Math.max(longestStreak, streak)
        continue
      }
      const prev = sorted[i - 1]
      const cur = sorted[i]
      const oneDayMs = 24 * 60 * 60 * 1000
      if (cur - prev === oneDayMs) {
        streak += 1
      } else if (cur === prev) {
        // same day duplicate shouldn't happen due to Set, but guard anyway
      } else {
        streak = 1
      }
      longestStreak = Math.max(longestStreak, streak)
    }

    return NextResponse.json({
      success: true,
      userId: walletAddress,
      dates: Array.from(dateKeys),
      currentStreak,
      longestStreak,
      totalPosts: journals.length
    })
  } catch (error) {
    console.error('Error computing streak:', error)
    return NextResponse.json({ success: false, error: 'Failed to compute streak' }, { status: 500 })
  }
}


