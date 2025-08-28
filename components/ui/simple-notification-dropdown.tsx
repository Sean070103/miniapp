"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  SimpleNotification, 
  formatTimeAgo, 
  getNotificationIcon, 
  getNotificationColor, 
  getNotificationBgColor 
} from '@/lib/simple-notifications'

interface SimpleNotificationDropdownProps {
  notifications: SimpleNotification[]
  unreadCount: number
  isLoading: boolean
  onMarkAsRead: (notificationIds?: string[]) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
  onNotificationClick?: (notification: SimpleNotification) => void
  className?: string
}

export function SimpleNotificationDropdown({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  className = ""
}: SimpleNotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
      onMarkAsRead(unreadIds)
    }
  }, [isOpen, unreadCount, notifications, onMarkAsRead])

  const handleNotificationClick = (notification: SimpleNotification) => {
    onNotificationClick?.(notification)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
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
            {unreadCount > 99 ? "99+" : unreadCount}
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
                {isLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-3"></div>
                    <p className="font-mono text-sm text-green-300 pixelated-text">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
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
                        className={`p-3 cursor-pointer transition-colors hover:bg-green-600/10 border-l-4 ${
                          getNotificationBgColor(notification.type)
                        } ${
                          !notification.isRead
                            ? "bg-green-600/5"
                            : "bg-transparent"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
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
                                {notification.senderId ? 
                                  `${notification.senderId.slice(0, 6)}...` : 
                                  'System'
                                }
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
                    onClick={onMarkAllAsRead}
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
