"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal, 
  TrendingUp, 
  Users, 
  Hash,
  Bell,
  Bookmark,
  Flag,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'

interface EnhancedFeedProps {
  userId: string
}

export function EnhancedFeed({ userId }: EnhancedFeedProps) {
  const [activeTab, setActiveTab] = useState('following')
  const [posts, setPosts] = useState<any[]>([])
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTags, setNewPostTags] = useState<string[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // Load feed data
  useEffect(() => {
    loadFeedData()
    loadNotifications()
  }, [activeTab, userId])

  const loadFeedData = async () => {
    setIsLoading(true)
    try {
      let endpoint = ''
      switch (activeTab) {
        case 'following':
          endpoint = `/api/feed/personalized?userId=${userId}&algorithm=following`
          break
        case 'trending':
          endpoint = `/api/trending?type=posts&period=24h`
          break
        case 'personalized':
          endpoint = `/api/feed/personalized?userId=${userId}&algorithm=hybrid`
          break
        default:
          endpoint = `/api/feed/personalized?userId=${userId}&algorithm=following`
      }

      const response = await fetch(endpoint)
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data)
      }
    } catch (error) {
      console.error('Error loading feed:', error)
      toast({
        title: "Error",
        description: "Failed to load feed data"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&unreadOnly=true`)
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadTrendingTopics = async () => {
    try {
      const response = await fetch('/api/trending?type=tags&period=24h')
      const data = await response.json()
      
      if (data.success) {
        setTrendingTopics(data.data)
      }
    } catch (error) {
      console.error('Error loading trending topics:', error)
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/like/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalId: postId,
          userId: user?.address
        })
      })

      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + 1, isLiked: true }
            : post
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    try {
      const response = await fetch('/api/follow', {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isFollowing ? undefined : JSON.stringify({
          followerId: userId,
          followingId: targetUserId
        })
      })

      if (response.ok) {
        toast({
          title: isFollowing ? "Unfollowed" : "Following",
          description: isFollowing ? "User unfollowed successfully" : "User followed successfully"
        })
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  const handleReport = async (postId: string, reason: string) => {
    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          contentId: postId,
          contentType: 'journal',
          type: 'inappropriate',
          reason
        })
      })

      if (response.ok) {
        toast({
          title: "Report Submitted",
          description: "Thank you for your report. We'll review it shortly."
        })
      }
    } catch (error) {
      console.error('Error reporting post:', error)
    }
  }

  const createPost = async () => {
    if (!newPostContent.trim()) return

    try {
      const response = await fetch('/api/journal/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUserId: userId,
          journal: newPostContent,
          tags: newPostTags,
          privacy: 'public'
        })
      })

      if (response.ok) {
        setNewPostContent('')
        setNewPostTags([])
        setShowCreatePost(false)
        loadFeedData()
        toast({
          title: "Post Created",
          description: "Your post has been published successfully!"
        })
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          notificationIds: [notificationId]
        })
      })
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error marking notification read:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Post Section */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              value={newPostContent}
              onChange={setNewPostContent}
              placeholder="What's happening on Base?"
              onTagAdd={(tag) => setNewPostTags(prev => [...prev, tag])}
              tags={newPostTags}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                Cancel
              </Button>
              <Button onClick={createPost}>
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="personalized">For You</TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {notifications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="following" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Following Feed</h3>
            <Button onClick={() => setShowCreatePost(true)}>
              Create Post
            </Button>
          </div>
          <FeedPosts posts={posts} onLike={handleLike} onFollow={handleFollow} onReport={handleReport} />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trending</h3>
            <Button onClick={() => setShowCreatePost(true)}>
              Create Post
            </Button>
          </div>
          <FeedPosts posts={posts} onLike={handleLike} onFollow={handleFollow} onReport={handleReport} />
        </TabsContent>

        <TabsContent value="personalized" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Personalized For You</h3>
            <Button onClick={() => setShowCreatePost(true)}>
              Create Post
            </Button>
          </div>
          <FeedPosts posts={posts} onLike={handleLike} onFollow={handleFollow} onReport={handleReport} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <NotificationsList 
            notifications={notifications} 
            onMarkRead={markNotificationRead} 
          />
        </TabsContent>
      </Tabs>

      {/* Trending Topics Sidebar */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendingTopics.slice(0, 10).map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">#{topic.tag}</span>
                </div>
                <Badge variant="secondary">{topic.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FeedPosts({ posts, onLike, onFollow, onReport }: any) {
  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={post.user?.profilePicture} />
                <AvatarFallback>{post.user?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.user?.username || 'Anonymous'}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.dateCreated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFollow(post.baseUserId, post.isFollowing)}
                    >
                      {post.isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-1" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-800 mb-3">{post.journal}</p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLike(post.id)}
                      className={post.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes || 0}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments || 0}
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReport(post.id, 'inappropriate')}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function NotificationsList({ notifications, onMarkRead }: any) {
  return (
    <div className="space-y-2">
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No new notifications
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification: any) => (
          <Card key={notification.id} className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.dateCreated).toLocaleString()}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkRead(notification.id)}
                >
                  Mark Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
