'use client';

import { useState } from 'react';
import NotificationList from '@/components/NotificationList';
import { NotificationTestButton } from '@/components/NotificationTestButton';

export default function TestNotificationsPage() {
  const [baseUserId, setBaseUserId] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baseUserId || !message) {
      setResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseUserId, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'Notification sent successfully!' });
        setMessage(''); // Clear message after successful send
      } else {
        setResult({ success: false, message: data.error || 'Failed to send notification' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error occurred' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Real-time Notification Test
          </h1>
          <p className="text-gray-600">
            Test the Pusher notification system with real-time updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Notification Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Send Test Notification
            </h2>
            
            <form onSubmit={sendNotification} className="space-y-4">
              <div>
                <label htmlFor="baseUserId" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID (Wallet Address)
                </label>
                <input
                  type="text"
                  id="baseUserId"
                  value={baseUserId}
                  onChange={(e) => setBaseUserId(e.target.value)}
                  placeholder="0x1234..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your notification message..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : 'Send Notification'}
              </button>
            </form>

            {result && (
              <div className={`mt-4 p-3 rounded-md ${
                result.success 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {result.message}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">Quick Test Examples:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>User ID:</strong> 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</p>
                <p><strong>Message:</strong> Hello! This is a test notification.</p>
                <button
                  onClick={() => {
                    setBaseUserId('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
                    setMessage('Hello! This is a test notification.');
                  }}
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  Fill with example data
                </button>
              </div>
            </div>
          </div>

          {/* Quick Test Button */}
          <div>
            <NotificationTestButton />
          </div>

          {/* Notification List */}
          <div>
            <NotificationList />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            How it Works
          </h2>
          <div className="space-y-3 text-gray-600">
            <p>1. <strong>Send a notification</strong> using the form or quick test button</p>
            <p>2. <strong>Watch it appear instantly</strong> in the notification list</p>
            <p>3. <strong>Real-time updates</strong> are powered by Pusher</p>
            <p>4. <strong>Multiple browser tabs</strong> will all receive the same notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}
