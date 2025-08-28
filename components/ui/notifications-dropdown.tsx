"use client"

import { useState, useEffect } from 'react'
import { Bell, Heart, Share2, MessageSquare, UserPlus, Check, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

interface Notification {
  id: string
  type: 'like' | 'repost' | 'comment' | 'follow' | 'post'
  title: string
  message: string
  isRead: boolean
  dateCreated: Date
  sender?: {
    id: string
    username?: string
    walletAddress: string
    profilePicture?: string
  }
}

interface NotificationsDropdownProps {
  notifications: Notification[]
  onMarkAsRead: (notificationIds?: string[]) => void
  onNotificationClick?: (notification: Notification) => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-400" />
    case 'repost':
      return <Share2 className="w-4 h-4 text-blue-400" />
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-green-400" />
    case 'follow':
      return <UserPlus className="w-4 h-4 text-purple-400" />
    case 'post':
      return <Bell className="w-4 h-4 text-yellow-400" />
    default:
      return <Bell className="w-4 h-4 text-blue-400" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'like':
      return 'border-l-red-500'
    case 'repost':
      return 'border-l-blue-500'
    case 'comment':
      return 'border-l-green-500'
    case 'follow':
      return 'border-l-purple-500'
    case 'post':
      return 'border-l-yellow-500'
    default:
      return 'border-l-blue-500'
  }
}

export function NotificationsDropdown({
  notifications,
  onMarkAsRead,
  onNotificationClick
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      onMarkAsRead(unreadIds)
    }
  }, [isOpen, unreadCount, notifications, onMarkAsRead])

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-green-100 hover:text-green-300 hover:bg-green-600/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-mono bg-red-500"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-2 border-green-500/30 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-mono text-sm text-green-100 pixelated-text">
                  Notifications
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="font-mono text-xs bg-green-600/20 text-green-300 border-green-500/30">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                    <p className="font-mono text-sm text-green-300 pixelated-text">
                      No notifications yet
                    </p>
                    <p className="font-mono text-xs text-green-400/70 mt-1">
                      When you get likes, comments, or reposts, they'll appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 cursor-pointer transition-colors hover:bg-green-600/10 border-l-4 ${getNotificationColor(notification.type)} ${
                          !notification.isRead ? 'bg-green-600/5' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Avatar */}
                          <Avatar className="w-8 h-8 border border-green-500/30 shadow-sm">
                            <AvatarImage src={notification.sender?.profilePicture} />
                            <AvatarFallback className="bg-green-600/20 text-green-300 font-mono text-xs">
                              {notification.sender?.username?.slice(0, 2).toUpperCase() || 
                               notification.sender?.walletAddress.slice(2, 4).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getNotificationIcon(notification.type)}
                              <h4 className="font-mono font-bold text-xs text-green-100 pixelated-text truncate">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                              )}
                            </div>
                            
                            <p className="font-mono text-xs text-green-300 leading-relaxed mb-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs text-green-400">
                                {notification.sender?.username || 
                                 `${notification.sender?.walletAddress.slice(0, 6)}...`}
                              </span>
                              <span className="font-mono text-xs text-green-400/70">
                                {formatTimeAgo(notification.dateCreated)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-3 border-t border-green-500/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead()}
                    className="w-full font-mono text-xs text-green-400 hover:text-green-300 hover:bg-green-600/20"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark all as read
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

