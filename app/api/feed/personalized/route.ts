import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/feed/personalized - Get personalized feed for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const algorithm = searchParams.get('algorithm') || 'hybrid' // 'following', 'trending', 'hybrid'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let feedPosts

    switch (algorithm) {
      case 'following':
        feedPosts = await getFollowingFeed(userId, limit, offset)
        break
      case 'trending':
        feedPosts = await getTrendingFeed(userId, limit, offset)
        break
      case 'hybrid':
        feedPosts = await getHybridFeed(userId, limit, offset)
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid algorithm parameter' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: feedPosts,
      algorithm,
      pagination: {
        limit,
        offset,
        total: feedPosts.length
      }
    })
  } catch (error) {
    console.error('Error in Personalized Feed GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getFollowingFeed(userId: string, limit: number, offset: number) {
  // Get users that the current user is following
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  })

  const followingIds = following.map(f => f.followingId)

  if (followingIds.length === 0) {
    // If not following anyone, return trending posts
    return getTrendingFeed(userId, limit, offset)
  }

  // Get posts from followed users
  const posts = await prisma.journal.findMany({
    where: {
      baseUserId: { in: followingIds },
      privacy: 'public',
      isHidden: false
    },
    include: {
      contentAnalytics: true
    },
    orderBy: { dateCreated: 'desc' },
    take: limit,
    skip: offset
  })

  return posts
}

async function getTrendingFeed(userId: string, limit: number, offset: number) {
  // Get trending posts based on engagement
  const posts = await prisma.journal.findMany({
    where: {
      privacy: 'public',
      isHidden: false,
      dateCreated: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    },
    include: {
      contentAnalytics: true
    },
    orderBy: [
      { likes: 'desc' },
      { dateCreated: 'desc' }
    ],
    take: limit,
    skip: offset
  })

  return posts
}

async function getHybridFeed(userId: string, limit: number, offset: number) {
  // Get user preferences and behavior
  const userPreferences = await getUserPreferences(userId)
  
  // Get following posts (60% weight)
  const followingPosts = await getFollowingFeed(userId, Math.floor(limit * 0.6), 0)
  
  // Get trending posts (40% weight)
  const trendingPosts = await getTrendingFeed(userId, Math.floor(limit * 0.4), 0)
  
  // Combine and personalize
  const allPosts = [...followingPosts, ...trendingPosts]
  const personalizedPosts = personalizeFeed(allPosts, userPreferences)
  
  // Remove duplicates and return
  const uniquePosts = removeDuplicatePosts(personalizedPosts)
  
  return uniquePosts.slice(offset, offset + limit)
}

async function getUserPreferences(userId: string) {
  // Get user's interaction history
  // Step 1: fetch ids for liked and commented journals (avoid strict relation typing)
  const [likedLikes, userComments, userTagRows] = await Promise.all([
    prisma.like.findMany({
      where: { userId },
      select: { journalId: true }
    }),
    prisma.comment.findMany({
      where: { baseUserId: userId },
      select: { journalId: true }
    }),
    prisma.journal.findMany({
      where: { baseUserId: userId },
      select: { tags: true }
    })
  ])

  // Step 2: fetch journals for those ids to grab tags
  const [likedJournals, commentedJournals] = await Promise.all([
    likedLikes.length
      ? prisma.journal.findMany({
          where: { id: { in: likedLikes.map((l) => l.journalId) } },
          select: { tags: true }
        })
      : Promise.resolve([] as { tags: string[] }[]),
    userComments.length
      ? prisma.journal.findMany({
          where: { id: { in: userComments.map((c) => c.journalId) } },
          select: { tags: true }
        })
      : Promise.resolve([] as { tags: string[] }[])
  ])

  // Extract preferred tags
  const allTags = [
    ...likedJournals.flatMap((p) => p.tags || []),
    ...commentedJournals.flatMap((p) => p.tags || []),
    ...userTagRows.flatMap((p) => p.tags)
  ]

  const tagFrequency: { [key: string]: number } = {}
  allTags.forEach(tag => {
    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
  })

  // Get top preferred tags
  const preferredTags = Object.entries(tagFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)

  return {
    preferredTags,
    interactionHistory: {
      likes: likedLikes.length,
      comments: userComments.length,
      posts: userTagRows.length
    }
  }
}

function personalizeFeed(posts: any[], preferences: any) {
  return posts.map(post => {
    let score = 0
    
    // Boost posts with preferred tags
    const matchingTags = post.tags.filter((tag: string) => 
      preferences.preferredTags.includes(tag)
    )
    score += matchingTags.length * 10
    
    // Boost posts with high engagement
    if (post.contentAnalytics) {
      const engagementRate = post.contentAnalytics.engagementRate || 0
      score += engagementRate * 5
    }
    
    // Boost recent posts
    const hoursSinceCreation = (Date.now() - new Date(post.dateCreated).getTime()) / (1000 * 60 * 60)
    const recencyScore = Math.exp(-hoursSinceCreation / 24)
    score += recencyScore * 20
    
    return {
      ...post,
      personalizationScore: score
    }
  }).sort((a, b) => b.personalizationScore - a.personalizationScore)
}

function removeDuplicatePosts(posts: any[]) {
  const seen = new Set()
  return posts.filter(post => {
    if (seen.has(post.id)) {
      return false
    }
    seen.add(post.id)
    return true
  })
}

// POST /api/feed/personalized/feedback - Submit user feedback for personalization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, postId, action, feedback } = body

    if (!userId || !postId || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID, post ID, and action are required' },
        { status: 400 }
      )
    }

    // Store user feedback for future personalization
    // This could be stored in a separate table for user preferences
    console.log('User feedback:', { userId, postId, action, feedback })

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback recorded successfully' 
    })
  } catch (error) {
    console.error('Error in Personalized Feed POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
