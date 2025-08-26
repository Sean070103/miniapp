import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/follow - Get follow relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'followers' or 'following'

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (type === 'followers') {
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              bio: true
            }
          }
        },
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: followers })
    } else if (type === 'following') {
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              bio: true
            }
          }
        },
        orderBy: { dateCreated: 'desc' }
      })

      return NextResponse.json({ success: true, data: following })
    } else {
      return NextResponse.json(
        { success: false, error: 'Type must be "followers" or "following"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in Follow GET:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/follow - Follow a user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { followerId, followingId } = body

    if (!followerId || !followingId) {
      return NextResponse.json(
        { success: false, error: 'Follower ID and Following ID are required' },
        { status: 400 }
      )
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Already following this user' },
        { status: 400 }
      )
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        following: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        senderId: followerId,
        receiverId: followingId,
        type: 'follow',
        title: 'New Follower',
        message: `${follow.follower.username || 'Someone'} started following you`,
        data: JSON.stringify({ followerId, followerUsername: follow.follower.username })
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            profilePicture: true
          }
        }
      }
    })

    // Update analytics
    await updateFollowAnalytics(followerId, followingId, 1)

    return NextResponse.json({ success: true, data: follow })
  } catch (error) {
    console.error('Error in Follow POST:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/follow - Unfollow a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const followerId = searchParams.get('followerId')
    const followingId = searchParams.get('followingId')

    if (!followerId || !followingId) {
      return NextResponse.json(
        { success: false, error: 'Follower ID and Following ID are required' },
        { status: 400 }
      )
    }

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (!follow) {
      return NextResponse.json(
        { success: false, error: 'Follow relationship not found' },
        { status: 404 }
      )
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    // Update analytics
    await updateFollowAnalytics(followerId, followingId, -1)

    return NextResponse.json({ success: true, message: 'Unfollowed successfully' })
  } catch (error) {
    console.error('Error in Follow DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateFollowAnalytics(followerId: string, followingId: string, change: number) {
  try {
    // Update follower's following count
    await prisma.userAnalytics.upsert({
      where: { userId: followerId },
      update: {
        totalFollowing: { increment: change }
      },
      create: {
        userId: followerId,
        totalFollowing: change > 0 ? 1 : 0
      }
    })

    // Update following's followers count
    await prisma.userAnalytics.upsert({
      where: { userId: followingId },
      update: {
        totalFollowers: { increment: change }
      },
      create: {
        userId: followingId,
        totalFollowers: change > 0 ? 1 : 0
      }
    })
  } catch (error) {
    console.error('Error updating follow analytics:', error)
  }
}
