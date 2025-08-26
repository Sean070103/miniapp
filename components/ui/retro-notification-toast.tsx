"use client"

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, Share2, MessageSquare, UserPlus } from 'lucide-react'

interface NotificationToastProps {
  notification: {
    id: string
    type: 'like' | 'repost' | 'comment' | 'follow'
    title: string
    message: string
    sender?: {
      id: string
      username?: string
      walletAddress: string
      profilePicture?: string
    }
    dateCreated: Date
  }
  onDismiss: () => void
  duration?: number
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500" />
    case 'repost':
      return <Share2 className="w-4 h-4 text-blue-500" />
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-green-500" />
    case 'follow':
      return <UserPlus className="w-4 h-4 text-purple-500" />
    default:
      return <Heart className="w-4 h-4 text-blue-500" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'like':
      return 'border-red-200 bg-red-50'
    case 'repost':
      return 'border-blue-200 bg-blue-50'
    case 'comment':
      return 'border-green-200 bg-green-50'
    case 'follow':
      return 'border-purple-200 bg-purple-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}

export function RetroNotificationToast({ 
  notification, 
  onDismiss, 
  duration = 4000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onDismiss, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <Card className={`w-80 border-2 ${getNotificationColor(notification.type)} shadow-lg`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
              <AvatarImage src={notification.sender?.profilePicture} />
              <AvatarFallback className="bg-blue-100 text-blue-800 font-mono text-sm">
                {notification.sender?.username?.slice(0, 2).toUpperCase() || 
                 notification.sender?.walletAddress.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getNotificationIcon(notification.type)}
                <h4 className="font-mono font-bold text-sm text-blue-900 truncate">
                  {notification.title}
                </h4>
              </div>
              
              <p className="font-mono text-xs text-blue-800 leading-relaxed">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-xs text-blue-600">
                  {notification.sender?.username || 
                   `${notification.sender?.walletAddress.slice(0, 6)}...`}
                </span>
                <span className="font-mono text-xs text-blue-500">
                  {new Date(notification.dateCreated).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onDismiss, 300)
              }}
              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
