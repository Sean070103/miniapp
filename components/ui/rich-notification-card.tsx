"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  User, 
  Clock, 
  Check,
  Reply,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface NotificationData {
  actorId?: string
  actorUsername?: string
  journalId?: string
  action?: string
  commentText?: string
}

interface RichNotificationCardProps {
  notification: {
    id: string
    type: 'like' | 'comment' | 'repost' | 'follow' | 'mention'
    title: string
    message: string
    data?: string
    isRead: boolean
    dateCreated: string
  }
  onMarkRead: (id: string) => void
  onAction?: (action: string, data: any) => void
  onNavigate?: (action: string, data: any) => void
  showActions?: boolean
}

export function RichNotificationCard({ 
  notification, 
  onMarkRead, 
  onAction,
  onNavigate,
  showActions = true 
}: RichNotificationCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Parse notification data
  const notificationData: NotificationData = notification.data 
    ? JSON.parse(notification.data) 
    : {}

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'repost':
        return <Share2 className="w-4 h-4 text-green-500" />
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-500" />
      case 'mention':
        return <User className="w-4 h-4 text-orange-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  // Get notification color based on type
  const getNotificationColor = () => {
    switch (notification.type) {
      case 'like':
        return 'border-red-500/20 bg-red-500/5'
      case 'comment':
        return 'border-blue-500/20 bg-blue-500/5'
      case 'repost':
        return 'border-green-500/20 bg-green-500/5'
      case 'follow':
        return 'border-purple-500/20 bg-purple-500/5'
      case 'mention':
        return 'border-orange-500/20 bg-orange-500/5'
      default:
        return 'border-gray-500/20 bg-gray-500/5'
    }
  }

  // Get action buttons based on notification type
  const getActionButtons = () => {
    if (!showActions) return null

    switch (notification.type) {
      case 'like':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('view_post', { journalId: notificationData.journalId })}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Post
            </Button>
          </div>
        )
      case 'comment':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('reply', { 
                journalId: notificationData.journalId,
                commentText: notificationData.commentText 
              })}
              className="text-xs"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('view_post', { journalId: notificationData.journalId })}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Post
            </Button>
          </div>
        )
      case 'repost':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('view_post', { journalId: notificationData.journalId })}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Post
            </Button>
          </div>
        )
      case 'follow':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('view_profile', { userId: notificationData.actorId })}
              className="text-xs"
            >
              <User className="w-3 h-3 mr-1" />
              View Profile
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('follow_back', { userId: notificationData.actorId })}
              className="text-xs"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Follow Back
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card 
      className={`
        transition-all duration-200 cursor-pointer
        ${getNotificationColor()}
        ${notification.isRead ? 'opacity-80' : 'opacity-100'}
        ${isHovered ? 'scale-[1.02] shadow-lg' : 'scale-100'}
        ${!notification.isRead ? 'ring-2 ring-blue-500/30' : 'ring-1 ring-gray-800/30'}
        bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-purple-500/20 backdrop-blur-xl gaming-glow
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Notification Icon */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${notification.isRead ? 'bg-gray-700/40' : 'bg-purple-600/30'}
            transition-colors duration-200 shadow-inner
          `}>
            {getNotificationIcon()}
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {/* User Avatar and Name */}
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notificationData.actorId || notificationData.actorUsername || 'user'}`} />
                    <AvatarFallback className="text-xs">
                      {notificationData.actorId ? notificationData.actorId.slice(0, 2).toUpperCase() : (notificationData.actorUsername?.charAt(0) || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-sm text-green-100 pixelated-text">
                    {notificationData.actorId ? `User_${notificationData.actorId.slice(0, 6)}` : (notificationData.actorUsername || 'Someone')}
                  </span>
                  {!notification.isRead && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-purple-600/30 text-purple-200 border border-purple-400/40">
                      New
                    </Badge>
                  )}
                </div>

                {/* Notification Message */}
                <p className="text-sm text-green-200/90 mb-2 leading-relaxed pixelated-text">
                  {notification.message}
                </p>

                {/* Comment Preview (if applicable) */}
                {notification.type === 'comment' && notificationData.commentText && (
                  <div className="bg-gray-900/60 rounded-lg p-2 mb-2 border-l-2 border-blue-500/60">
                    <p className="text-xs text-blue-200/90 italic">
                      "{notificationData.commentText}"
                    </p>
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center gap-2 text-xs text-green-300/70">
                  <Clock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(notification.dateCreated), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Action Menu */}
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkRead(notification.id)
                    }}
                    className="w-8 h-8 p-0 text-green-200 hover:bg-green-900/30"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 text-green-200 hover:bg-purple-900/30"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            {getActionButtons() && (
              <div className="mt-3 pt-3 border-t border-purple-500/20">
                {getActionButtons()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
