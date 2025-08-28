'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Heart, Share2, MessageSquare, UserPlus, X } from 'lucide-react';

interface RealTimeToastProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxToasts?: number;
  autoHideDuration?: number;
}

export function RealTimeToast({ 
  position = 'top-right', 
  maxToasts = 3, 
  autoHideDuration = 5000 
}: RealTimeToastProps) {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<any[]>([]);

  // Real-time socket connection for live notifications
  const { isConnected: isSocketConnected } = useSocket({
    userId: user?.address,
    onNotification: (notification) => {
      console.log('Real-time toast notification received:', notification);
      
      // Add new toast with unique ID
      const toastId = `toast-${Date.now()}-${Math.random()}`;
      const newToast = {
        id: toastId,
        notification,
        timestamp: new Date()
      };

      setToasts(prev => [newToast, ...prev.slice(0, maxToasts - 1)]);

      // Auto-hide after specified duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== toastId));
      }, autoHideDuration);
    },
    onConnect: () => {
      console.log('Socket connected for real-time toasts');
    },
    onDisconnect: () => {
      console.log('Socket disconnected from real-time toasts');
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

  const handleDismiss = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const handleDismissAll = () => {
    setToasts([]);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };

  if (!user?.isConnected || toasts.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-sm`}>
      {/* Dismiss All Button */}
      {toasts.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="bg-gray-900/80 text-green-400 hover:text-green-300 text-xs border border-green-500/30"
          >
            <X className="w-3 h-3 mr-1" />
            Dismiss All
          </Button>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-green-500/30 shadow-lg animate-in slide-in-from-right duration-300"
        >
          <CardContent className="p-3">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <Avatar className="w-8 h-8 border border-green-500/30">
                <AvatarImage src={toast.notification.sender?.profilePicture} />
                <AvatarFallback className="bg-green-600/20 text-green-300 font-semibold text-xs">
                  {toast.notification.sender?.username?.slice(0, 2).toUpperCase() || 
                   toast.notification.sender?.walletAddress.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getNotificationIcon(toast.notification.type)}
                  <span className="font-semibold text-green-100 text-sm">
                    {toast.notification.sender?.username || 
                     `${toast.notification.sender?.walletAddress.slice(0, 6)}...`}
                  </span>
                  <Badge className="bg-green-500 text-white text-xs">New</Badge>
                  <span className="text-xs text-green-400/70 ml-auto">
                    {formatTimeAgo(toast.timestamp)}
                  </span>
                </div>
                
                <p className="text-green-200 text-sm">{toast.notification.message}</p>
                
                {/* Show post preview if available */}
                {toast.notification.data && toast.notification.data.postPreview && (
                  <div className="bg-gray-800/50 rounded-lg p-2 mt-2 border border-gray-700/50">
                    <p className="text-xs text-green-300/80 italic">
                      "{toast.notification.data.postPreview}"
                    </p>
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(toast.id)}
                className="text-green-400 hover:text-green-300 p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
