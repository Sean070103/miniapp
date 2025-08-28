'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useNotifications } from '@/hooks/use-notifications';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Share2, MessageSquare, UserPlus, Eye, Check } from 'lucide-react';
import { useSocket } from '@/hooks/use-socket';

interface Notification {
  id: string;
  type: 'like' | 'repost' | 'comment' | 'follow' | 'post';
  title: string;
  message: string;
  isRead: boolean;
  dateCreated: Date;
  sender?: {
    id: string;
    username?: string;
    walletAddress: string;
    profilePicture?: string;
  };
  data?: any;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Real-time socket connection for live notifications
  const { isConnected: isSocketConnected } = useSocket({
    userId: user?.address,
    onNotification: (notification) => {
      console.log('Real-time notification received:', notification);
      // The useNotifications hook will handle updating the notifications list
    },
    onConnect: () => {
      console.log('Socket connected for notifications page');
    },
    onDisconnect: () => {
      console.log('Socket disconnected from notifications page');
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'repost':
        return <Share2 className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'post':
        return <Bell className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-l-red-500';
      case 'repost':
        return 'border-l-blue-500';
      case 'comment':
        return 'border-l-green-500';
      case 'follow':
        return 'border-l-purple-500';
      case 'post':
        return 'border-l-yellow-500';
      default:
        return 'border-l-gray-500';
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

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
    
    // You can add navigation logic here based on notification type
    console.log('Notification clicked:', notification);
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  if (!user?.isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-100 mb-2">Connect Your Wallet</h2>
          <p className="text-green-300">Please connect your wallet to view notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-green-100 pixelated-text">Notifications</h1>
              <p className="text-green-300 pixelated-text">Stay updated with your crypto activities</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-green-400">
                {isSocketConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </Button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-green-300 mt-2">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-green-500/30">
              <CardContent className="p-8 text-center">
                <Bell className="w-16 h-16 text-green-400/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-100 mb-2">No notifications yet</h3>
                <p className="text-green-300 mb-4">
                  When you get likes, comments, reposts, or other interactions, they'll appear here in real-time.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Go to Feed
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-green-500/30 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                  !notification.isRead ? 'ring-2 ring-green-500/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <Avatar className="w-12 h-12 border-2 border-green-500/30">
                      <AvatarImage src={notification.sender?.profilePicture} />
                      <AvatarFallback className="bg-green-600/20 text-green-300 font-semibold">
                        {notification.sender?.username?.slice(0, 2).toUpperCase() || 
                         notification.sender?.walletAddress.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getNotificationIcon(notification.type)}
                        <span className="font-semibold text-green-100">
                          {notification.sender?.username || 
                           `${notification.sender?.walletAddress.slice(0, 6)}...`}
                        </span>
                        {!notification.isRead && (
                          <Badge className="bg-green-500 text-white text-xs">New</Badge>
                        )}
                        <span className="text-sm text-green-400/70 ml-auto">
                          {formatTimeAgo(notification.dateCreated)}
                        </span>
                      </div>
                      
                      <p className="text-green-200 mb-2">{notification.message}</p>
                      
                      {/* Show post preview if available */}
                      {notification.data && notification.data.postPreview && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mt-2 border border-gray-700/50">
                          <p className="text-sm text-green-300/80 italic">
                            "{notification.data.postPreview}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Mark All as Read Button */}
        {notifications.filter(n => !n.isRead).length > 0 && (
          <div className="mt-6 text-center">
            <Button
              onClick={() => markAsRead()}
              variant="outline"
              className="border-green-500/30 text-green-300 hover:bg-green-600/20"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
