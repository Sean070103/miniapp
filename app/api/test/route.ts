import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection by getting counts
    const [userCount, journalCount, commentCount, repostCount, chainCommentCount] = await Promise.all([
      prisma.baseUser.count(),
      prisma.journal.count(),
      prisma.comment.count(),
      prisma.repost.count(),
      prisma.chaincomments.count()
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: 'Database connection successful',
        counts: {
          users: userCount,
          journals: journalCount,
          comments: commentCount,
          reposts: repostCount,
          chainComments: chainCommentCount
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed', 
      },
      { status: 500 }
    )
  }
}
