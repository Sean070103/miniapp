'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  createdAt: string;
}

export default function TestNotificationsSimple() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [testMessage, setTestMessage] = useState('🔥 Test notification from Vercel!');

  useEffect(() => {
    // Connect to Pusher
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.error('Pusher environment variables not configured');
      return;
    }

    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true
    });

    // Subscribe to general notifications channel
    const channel = pusher.subscribe('notifications');

    // Listen for new notifications
    channel.bind('new-notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    pusher.connection.bind('connected', () => {
      console.log('Connected to Pusher');
      setIsConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      console.log('Disconnected from Pusher');
      setIsConnected(false);
    });

    return () => {
      pusher.unsubscribe('notifications');
      pusher.disconnect();
    };
  }, []);

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseUserId: '0x9dEa1234567890abcdef1234567890abcdef1234',
          message: testMessage,
          type: 'test'
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Notification sent successfully:', data);
        alert('✅ Notification sent! Check the list below.');
      } else {
        console.error('Failed to send notification:', data);
        alert('❌ Failed to send notification: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('❌ Error sending notification');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-green-100 mb-4">🧪 Simple Notification Test</h1>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-green-300">
              {isConnected ? 'Connected to Pusher' : 'Disconnected from Pusher'}
            </span>
          </div>

          {/* Test Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-green-300 mb-2">Test Message:</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Enter test message..."
              />
            </div>
            
            <button
              onClick={sendTestNotification}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-semibold"
            >
              🚀 Send Test Notification
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/30 border border-blue-500/30 rounded p-4 mb-6">
            <h3 className="text-blue-300 font-semibold mb-2">📋 Instructions:</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Enter a test message above</li>
              <li>• Click "Send Test Notification"</li>
              <li>• Watch for real-time notifications below</li>
              <li>• Check browser console for detailed logs</li>
            </ul>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-100 mb-4">
            📋 Notifications ({notifications.length})
          </h2>
          
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No notifications yet</p>
              <p className="text-sm mt-2">Send a test notification to see it appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          {notification.type.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-sm">
                          User: {notification.userId.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-white">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 ml-4">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-bold text-green-100 mb-4">🔧 Debug Information</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Pusher Key:</strong> {process.env.NEXT_PUBLIC_PUSHER_KEY ? '✅ Configured' : '❌ Missing'}</p>
            <p><strong>Pusher Cluster:</strong> {process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? '✅ Configured' : '❌ Missing'}</p>
            <p><strong>Connection Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
            <p><strong>Channel:</strong> notifications</p>
            <p><strong>Event:</strong> new-notification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
