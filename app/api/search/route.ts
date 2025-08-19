import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search - Enhanced search functionality
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'all', 'users', 'posts', 'tags'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'relevance' // 'relevance', 'date', 'popularity'

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const searchQuery = query.trim()
    const results: any = {
      users: [],
      posts: [],
      tags: [],
      total: 0
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.baseUser.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { bio: { contains: searchQuery, mode: 'insensitive' } },
            { walletAddress: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          username: true,
          bio: true,
          profilePicture: true,
          walletAddress: true,
          dateCreated: true,
          _count: {
            select: {
              followers: true,
              following: true
            }
          }
        },
        take: limit,
        skip: offset,
        orderBy: sortBy === 'date' ? { dateCreated: 'desc' } : 
                sortBy === 'popularity' ? { followers: { _count: 'desc' } } :
                { username: 'asc' }
      })

      results.users = users
    }

    // Search posts/journals
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.journal.findMany({
        where: {
          OR: [
            { journal: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } }
          ],
          privacy: 'public'
        },
        include: {
          contentAnalytics: true
        },
        take: limit,
        skip: offset,
        orderBy: sortBy === 'date' ? { dateCreated: 'desc' } :
                sortBy === 'popularity' ? { likes: 'desc' } :
                { dateCreated: 'desc' }
      })

      results.posts = posts
    }

    // Search tags
    if (type === 'all' || type === 'tags') {
      const tagResults = await prisma.journal.findMany({
        where: {
          tags: { hasSome: [searchQuery] },
          privacy: 'public'
        },
        select: {
          tags: true
        },
        take: 100
      })

      // Count tag occurrences
      const tagCounts: { [key: string]: number } = {}
      tagResults.forEach(post => {
        post.tags.forEach(tag => {
          if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          }
        })
      })

      results.tags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    }

    // Calculate total results
    results.total = results.users.length + results.posts.length + results.tags.length

    return NextResponse.json({
      success: true,
      data: results,
      query: searchQuery,
      pagination: {
        limit,
        offset,
        total: results.total
      }
    })
  } catch (error) {
    console.error('Error in Search GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/search - Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query, 
      filters = {}, 
      sortBy = 'relevance',
      limit = 20,
      offset = 0 
    } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const searchQuery = query.trim()
    const { dateRange, tags, privacy, userType } = filters

    // Build where clause for posts
    const postWhereClause: any = {
      OR: [
        { journal: { contains: searchQuery, mode: 'insensitive' } },
        { tags: { hasSome: [searchQuery] } }
      ]
    }

    if (dateRange) {
      postWhereClause.dateCreated = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end)
      }
    }

    if (tags && tags.length > 0) {
      postWhereClause.tags = { hasSome: tags }
    }

    if (privacy) {
      postWhereClause.privacy = privacy
    }

    const posts = await prisma.journal.findMany({
      where: postWhereClause,
      include: {
        contentAnalytics: true
      },
      take: limit,
      skip: offset,
      orderBy: sortBy === 'date' ? { dateCreated: 'desc' } :
              sortBy === 'popularity' ? { likes: 'desc' } :
              { dateCreated: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: posts,
      query: searchQuery,
      filters,
      pagination: {
        limit,
        offset,
        total: posts.length
      }
    })
  } catch (error) {
    console.error('Error in Search POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
