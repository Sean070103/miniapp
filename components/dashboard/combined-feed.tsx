"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Calendar, 
  User,
  Flame,
  BookOpen,
  Plus,
  Repeat,
  Send,
  MoreHorizontal,
  ThumbsUp,
  Reply
} from 'lucide-react'

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  photos?: string[]
  timestamp: number
}

interface PublicPost {
  id: string
  baseUserId: string
  journal: string
  photos: string[]
  likes: number
  tags: string[]
  privacy: string
  dateCreated: string
}

interface CombinedFeedProps {
  entries: DailyEntry[]
  userAddress: string
}

interface Comment {
  id: string
  postId: string
  userId: string
  content: string
  timestamp: number
}

export function CombinedFeed({ entries, userAddress }: CombinedFeedProps) {
  const [publicPosts, setPublicPosts] = useState<PublicPost[]>([])
  const [isLoadingPublic, setIsLoadingPublic] = useState(true)
  const [combinedFeed, setCombinedFeed] = useState<any[]>([])
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({})
  const [showCommentDialog, setShowCommentDialog] = useState<string | null>(null)
  const [newComment, setNewComment] = useState("")
  const [showReplyDialog, setShowReplyDialog] = useState<string | null>(null)
  const [newReply, setNewReply] = useState("")

  // Load public posts from database
  const fetchPublicPosts = async () => {
    try {
      const response = await fetch('/api/journal/get')
      if (response.ok) {
        const data = await response.json()
        console.log('All posts from API:', data.length)
        
        // Filter to only show public posts from other users
        const otherUsersPublicPosts = data.filter((post: any) => {
          const isPublic = post.privacy === 'public'
          const isOtherUser = post.baseUserId !== userAddress
          const shouldInclude = isPublic && isOtherUser
          
          if (!shouldInclude) {
            console.log('Filtered out post:', {
              id: post.id,
              privacy: post.privacy,
              baseUserId: post.baseUserId,
              userAddress: userAddress,
              isPublic,
              isOtherUser
            })
          }
          
          return shouldInclude
        })
        
        console.log('Filtered public posts from other users:', otherUsersPublicPosts.length)
        setPublicPosts(otherUsersPublicPosts)
      }
    } catch (error) {
      console.error('Error fetching public posts:', error)
    } finally {
      setIsLoadingPublic(false)
    }
  }

  useEffect(() => {
    fetchPublicPosts()
  }, [userAddress])

  // Refresh public posts when entries change (new post created)
  useEffect(() => {
    if (entries.length > 0) {
      fetchPublicPosts()
    }
  }, [entries.length])

  // Combine and sort posts
  useEffect(() => {
    const userPosts = entries.map(entry => ({
      ...entry,
      type: 'user',
      isOwnPost: true,
      displayName: 'DailyBase',
      userAddress: userAddress
    }))

    const communityPosts = publicPosts.map(post => ({
      id: post.id,
      date: new Date(post.dateCreated).toISOString().split('T')[0],
      content: post.journal,
      tags: post.tags || [],
      photos: post.photos || [],
      timestamp: new Date(post.dateCreated).getTime(),
      type: 'community',
      isOwnPost: false,
      displayName: getUserDisplay(post.baseUserId),
      userAddress: post.baseUserId,
      likes: post.likes
    }))

    // Combine and sort by timestamp (newest first)
    const combined = [...userPosts, ...communityPosts].sort((a, b) => b.timestamp - a.timestamp)
    
    // Remove duplicates based on content and timestamp (within 1 minute)
    const uniquePosts = combined.filter((post, index, array) => {
      // Check if this post has a duplicate with same content and similar timestamp
      const duplicateIndex = array.findIndex((otherPost, otherIndex) => {
        if (index === otherIndex) return false
        
        // Check if content is the same
        const sameContent = post.content === otherPost.content
        
        // Check if timestamps are within 1 minute of each other
        const timeDiff = Math.abs(post.timestamp - otherPost.timestamp)
        const withinOneMinute = timeDiff <= 60000 // 60 seconds in milliseconds
        
        // Check if photos are the same (if both have photos)
        const samePhotos = post.photos && otherPost.photos && 
          post.photos.length === otherPost.photos.length &&
          post.photos.every((photo: string, i: number) => photo === otherPost.photos![i])
        
        return sameContent && withinOneMinute && (samePhotos || (!post.photos && !otherPost.photos))
      })
      
      // Keep the first occurrence (user post takes priority)
      return duplicateIndex === -1 || duplicateIndex > index
    })
    
    setCombinedFeed(uniquePosts)
  }, [entries, publicPosts, userAddress])

  // Get user display name from address
  const getUserDisplay = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Handle like
  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // Handle repost
  const handleRepost = (postId: string) => {
    setRepostedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // Handle comment
  const handleComment = (postId: string) => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        postId,
        userId: userAddress,
        content: newComment.trim(),
        timestamp: Date.now()
      }
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment]
      }))
      
      setNewComment("")
      setShowCommentDialog(null)
    }
  }

  // Handle reply
  const handleReply = (postId: string) => {
    if (newReply.trim()) {
      const reply: Comment = {
        id: Date.now().toString(),
        postId,
        userId: userAddress,
        content: newReply.trim(),
        timestamp: Date.now()
      }
      
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), reply]
      }))
      
      setNewReply("")
      setShowReplyDialog(null)
    }
  }

  // Image component with fallback
  const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
    const [hasError, setHasError] = useState(false)

    if (hasError) {
      return (
        <div className={`${className} bg-slate-600 flex items-center justify-center`}>
          <div className="text-center text-slate-400">
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        style={{ objectFit: 'cover' }}
      />
    )
  }

  if (isLoadingPublic) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-slate-600 rounded-full animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-600 rounded animate-pulse w-[200px]" />
                  <div className="h-4 bg-slate-600 rounded animate-pulse w-[150px]" />
                </div>
              </div>
              <div className="h-[120px] bg-slate-600 rounded-xl animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (combinedFeed.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-white pixelated-text mb-3">Your Feed is Empty</h3>
          <p className="text-blue-300 text-center mb-8 max-w-md leading-relaxed">
            Start your DailyBase journey by creating your first entry. Share your crypto activities, track your progress, and build meaningful streaks.
          </p>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text px-8 py-3 text-lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Entry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {combinedFeed.map((post, index) => (
        <Card key={post.id} className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass hover-lift transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-blue-400/20 flex-shrink-0">
                  <AvatarFallback className={`font-semibold ${
                    post.isOwnPost 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  }`}>
                    {post.isOwnPost ? 'DB' : post.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-white pixelated-text text-lg">
                      {post.displayName}
                    </div>
                    {post.isOwnPost ? (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text text-xs">
                        You
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text text-xs">
                        <User className="w-3 h-3 mr-1" />
                        Community
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-blue-300 pixelated-text flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.date)}
                    <span className="text-blue-300/60">•</span>
                    <span>{new Date(post.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
              <p className="text-white leading-relaxed pixelated-text text-lg">{post.content}</p>
            </div>
            
            {/* Photo Display - X Style */}
            {post.photos && post.photos.length > 0 && (
              <div className="mb-4">
                <div className={`grid gap-1 rounded-xl overflow-hidden ${
                  post.photos.length === 1 ? 'grid-cols-1' :
                  post.photos.length === 2 ? 'grid-cols-2' :
                  post.photos.length === 3 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {post.photos.map((photo: string, photoIndex: number) => (
                    <div key={photoIndex} className={`relative group cursor-pointer ${
                      post.photos!.length === 3 && photoIndex === 2 ? 'col-span-2' : ''
                    }`}>
                      <div className="w-full h-full bg-slate-600 overflow-hidden">
                        <ImageWithFallback
                          src={photo}
                          alt={`Post image ${photoIndex + 1}`}
                          className={`w-full h-full transition-transform duration-200 group-hover:scale-105 ${
                            post.photos!.length === 1 ? 'max-h-96' :
                            post.photos!.length === 2 ? 'h-48' :
                            post.photos!.length === 3 && photoIndex === 2 ? 'h-48' : 'h-48'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string, tagIndex: number) => (
                  <Badge key={tagIndex} className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text hover:bg-blue-500/30 transition-colors">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Comments Section */}
            {comments[post.id] && comments[post.id].length > 0 && (
              <div className="mb-4 space-y-3">
                <div className="border-t border-slate-600/30 pt-3">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2 pixelated-text">Comments</h4>
                  {comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg mb-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs">
                          {getUserDisplay(comment.userId).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white pixelated-text">
                            {getUserDisplay(comment.userId)}
                          </span>
                          <span className="text-xs text-blue-300/60">
                            {formatDate(new Date(comment.timestamp).toISOString())}
                          </span>
                        </div>
                        <p className="text-sm text-white pixelated-text">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-600/30">
              <div className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(post.id)}
                  className={`transition-colors ${
                    likedPosts.has(post.id) 
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
                      : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                  {(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)} likes
                </Button>

                <Dialog open={showCommentDialog === post.id} onOpenChange={(open) => setShowCommentDialog(open ? post.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {comments[post.id]?.length || 0} comments
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-600 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-blue-300 pixelated-text">Add a Comment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white pixelated-text"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowCommentDialog(null)}
                          className="bg-slate-700 border-slate-600 text-white pixelated-text"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleComment(post.id)}
                          disabled={!newComment.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white pixelated-text"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRepost(post.id)}
                  className={`transition-colors ${
                    repostedPosts.has(post.id) 
                      ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' 
                      : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'
                  }`}
                >
                  <Repeat className={`w-4 h-4 mr-2 ${repostedPosts.has(post.id) ? 'fill-current' : ''}`} />
                  {repostedPosts.has(post.id) ? 'Reposted' : 'Repost'}
                </Button>

                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-green-400 hover:bg-green-500/10">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="text-xs text-blue-300/50">
                {post.isOwnPost ? `Entry #${entries.length - index}` : 'Community Post'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
