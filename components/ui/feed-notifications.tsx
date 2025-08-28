'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useSocket } from '@/hooks/use-socket';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Share2, MessageSquare, UserPlus, X, Check } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface FeedNotificationsProps {
  maxNotifications?: number;
  showAll?: boolean;
}

export function FeedNotifications({ maxNotifications = 5, showAll = false }: FeedNotificationsProps) {
  const { user } = useAuth();
  const { notifications, markAsRead, isLoading } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(true);
  const [newNotifications, setNewNotifications] = useState<any[]>([]);

  // Real-time socket connection for live notifications
  const { isConnected: isSocketConnected, connectionError } = useSocket({
    userId: user?.address,
    onNotification: (notification) => {
      console.log('Real-time notification received in feed:', notification);
      // Add new notification to the top of the list
      setNewNotifications(prev => [notification, ...prev.slice(0, maxNotifications - 1)]);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNewNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    },
    onConnect: () => {
      console.log('Socket connected for feed notifications');
    },
    onDisconnect: () => {
      console.log('Socket disconnected from feed notifications');
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'repost':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'post':
        return <Bell className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    console.log('Notification clicked:', notification);
  };

  const handleDismiss = (notificationId: string) => {
    setNewNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleDismissAll = () => {
    setNewNotifications([]);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  // Show recent unread notifications + new real-time notifications
  const recentNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, maxNotifications);

  const allNotifications = [...newNotifications, ...recentNotifications]
    .slice(0, maxNotifications);

  if (!user?.isConnected || (!showAll && allNotifications.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Live Notifications Header */}
      {newNotifications.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-sm font-semibold text-green-100 pixelated-text">
              Live Updates ({newNotifications.length})
            </span>
            {connectionError && (
              <span className="text-xs text-red-400" title={connectionError}>
                ⚠️ Connection issues
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-green-400 hover:text-green-300 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Dismiss All
          </Button>
        </div>
      )}

      {/* Notifications Feed */}
      <div className="space-y-2">
        {allNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-green-500/30 transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
              !notification.isRead ? 'ring-2 ring-green-500/30' : ''
            } ${newNotifications.some(n => n.id === notification.id) ? 'animate-pulse' : ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <CardContent className="p-3">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <Avatar className="w-8 h-8 border border-green-500/30">
                  <AvatarImage src={notification.sender?.profilePicture} />
                  <AvatarFallback className="bg-green-600/20 text-green-300 font-semibold text-xs">
                    {notification.sender?.username?.slice(0, 2).toUpperCase() || 
                     notification.sender?.walletAddress.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getNotificationIcon(notification.type)}
                    <span className="font-semibold text-green-100 text-sm">
                      {notification.sender?.username || 
                       `${notification.sender?.walletAddress.slice(0, 6)}...`}
                    </span>
                    {!notification.isRead && (
                      <Badge className="bg-green-500 text-white text-xs">New</Badge>
                    )}
                    <span className="text-xs text-green-400/70 ml-auto">
                      {formatTimeAgo(notification.dateCreated)}
                    </span>
                  </div>
                  
                  <p className="text-green-200 text-sm">{notification.message}</p>
                  
                  {/* Show post preview if available */}
                  {notification.data && notification.data.postPreview && (
                    <div className="bg-gray-800/50 rounded-lg p-2 mt-2 border border-gray-700/50">
                      <p className="text-xs text-green-300/80 italic">
                        "{notification.data.postPreview}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Dismiss button for new notifications */}
                {newNotifications.some(n => n.id === notification.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDismiss(notification.id);
                    }}
                    className="text-green-400 hover:text-green-300 p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mark All as Read Button */}
      {notifications.filter(n => !n.isRead).length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-300 hover:bg-green-600/20 text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Mark all as read
          </Button>
        </div>
      )}

      {/* View All Notifications Link */}
      {showAll && notifications.length > maxNotifications && (
        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/notifications'}
            variant="ghost"
            size="sm"
            className="text-green-400 hover:text-green-300 text-xs"
          >
            View all notifications ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );
}
