// Simple Notification System
// Clean, efficient notification management

export interface SimpleNotification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'follow' | 'mention' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  dateCreated: Date;
  senderId?: string;
  receiverId: string;
  postId?: string;
  data?: any;
}

export interface NotificationPreferences {
  likes: boolean;
  comments: boolean;
  reposts: boolean;
  follows: boolean;
  mentions: boolean;
  system: boolean;
}

// Default notification preferences
export const DEFAULT_PREFERENCES: NotificationPreferences = {
  likes: true,
  comments: true,
  reposts: true,
  follows: true,
  mentions: true,
  system: true,
};

// Notification type configurations
export const NOTIFICATION_CONFIG = {
  like: {
    title: 'New Like',
    icon: '❤️',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  comment: {
    title: 'New Comment',
    icon: '💬',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  repost: {
    title: 'New Repost',
    icon: '🔄',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  follow: {
    title: 'New Follower',
    icon: '👤',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  mention: {
    title: 'Mentioned You',
    icon: '📢',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  system: {
    title: 'System Notice',
    icon: '🔔',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
  },
};

// Utility functions
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

export const getNotificationIcon = (type: SimpleNotification['type']) => {
  return NOTIFICATION_CONFIG[type]?.icon || '🔔';
};

export const getNotificationColor = (type: SimpleNotification['type']) => {
  return NOTIFICATION_CONFIG[type]?.color || 'text-gray-500';
};

export const getNotificationBgColor = (type: SimpleNotification['type']) => {
  return NOTIFICATION_CONFIG[type]?.bgColor || 'bg-gray-500/10';
};

// Create notification message based on type
export const createNotificationMessage = (
  type: SimpleNotification['type'],
  senderName: string,
  postContent?: string
): string => {
  switch (type) {
    case 'like':
      return `${senderName} liked your post`;
    case 'comment':
      return `${senderName} commented on your post`;
    case 'repost':
      return `${senderName} reposted your content`;
    case 'follow':
      return `${senderName} started following you`;
    case 'mention':
      return `${senderName} mentioned you in a post`;
    case 'system':
      return 'System notification';
    default:
      return 'New notification';
  }
};
