import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const journalCount = await prisma.journal.count()
    const userCount = await prisma.baseUser.count()
    
    // Get a few sample journals
    const sampleJournals = await prisma.journal.findMany({
      take: 5,
      orderBy: { dateCreated: 'desc' },
      select: {
        id: true,
        baseUserId: true,
        journal: true,
        dateCreated: true,
        privacy: true,
        isHidden: true,
        archived: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        totalJournals: journalCount,
        totalUsers: userCount
      },
      sampleJournals,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
