import prisma from '../../../utils/connect'

export async function GET() {
  try {
    // Test the database connection by trying to count records
    const userCount = await prisma.baseUsers.count()
    const journalCount = await prisma.journal.count()
    const commentCount = await prisma.comment.count()
    const repostCount = await prisma.repost.count()
    const chainCommentCount = await prisma.chaincomments.count()

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Database connection successful',
        counts: {
          users: userCount,
          journals: journalCount,
          comments: commentCount,
          reposts: repostCount,
          chainComments: chainCommentCount
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
