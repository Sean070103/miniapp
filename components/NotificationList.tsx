'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe('notifications');

    const handleNewNotification = (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
    };

    const handleConnected = () => {
      console.log('Connected to Pusher');
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      console.log('Disconnected from Pusher');
      setIsConnected(false);
    };

    channel.bind('new-notification', handleNewNotification);
    pusherClient.connection.bind('connected', handleConnected);
    pusherClient.connection.bind('disconnected', handleDisconnected);

    // Set initial connection state
    if (pusherClient.connection.state === 'connected') {
      setIsConnected(true);
    }

    // Cleanup on unmount
    return () => {
      pusherClient.unsubscribe('notifications');
      pusherClient.connection.unbind('connected', handleConnected);
      pusherClient.connection.unbind('disconnected', handleDisconnected);
      channel.unbind('new-notification', handleNewNotification);
    };
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No notifications yet</p>
            <p className="text-sm mt-2">Send a notification to see it appear here in real-time!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      User: {notification.userId.slice(0, 8)}...
                    </p>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
