'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Check, X, Heart, MessageSquare, Share2, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function NotificationTestButton() {
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const { user } = useAuth();

  const testNotification = async (type: 'like' | 'comment' | 'repost' | 'follow' | 'post') => {
    if (!user?.address) {
      setLastResult({ success: false, message: 'Please connect your wallet first' });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      let endpoint = '';
      let body = {};

      switch (type) {
        case 'like':
          endpoint = '/api/like/post';
          body = {
            journalId: 'test-journal-id',
            userId: user.address
          };
          break;
        case 'comment':
          endpoint = '/api/comment/post';
          body = {
            baseUserId: user.address,
            journalId: 'test-journal-id',
            comment: 'This is a test comment!'
          };
          break;
        case 'repost':
          endpoint = '/api/repost/post';
          body = {
            journalId: 'test-journal-id',
            baseUserId: user.address
          };
          break;
        case 'follow':
          endpoint = '/api/follow';
          body = {
            followerId: user.address,
            followingId: user.address // This will fail but trigger notification logic
          };
          break;
        case 'post':
          endpoint = '/api/journal/post';
          body = {
            baseUserId: user.address,
            journal: 'This is a test post for notifications!',
            privacy: 'public'
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setLastResult({ success: true, message: `✅ ${type} test completed successfully!` });
      } else {
        const data = await response.json();
        setLastResult({ success: false, message: `❌ ${type} test: ${data.error || 'Failed'}` });
      }
    } catch (error) {
      setLastResult({ success: false, message: `❌ ${type} test: Network error` });
    } finally {
      setIsSending(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'repost': return <Share2 className="w-4 h-4" />;
      case 'follow': return <UserPlus className="w-4 h-4" />;
      case 'post': return <Bell className="w-4 h-4" />;
      default: return <Send className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-green-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-100 pixelated-text text-sm">
          <Bell className="w-4 h-4 text-green-400" />
          Notification Tests
          <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-300 border-green-500/30">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(['like', 'comment', 'repost', 'follow', 'post'] as const).map((type) => (
            <Button
              key={type}
              onClick={() => testNotification(type)}
              disabled={isSending || !user?.address}
              className="bg-green-600 hover:bg-green-700 text-white pixelated-text text-xs"
            >
              {getIcon(type)}
              <span className="ml-1 capitalize">{type}</span>
            </Button>
          ))}
        </div>

        {lastResult && (
          <div className={`p-3 rounded-lg border ${
            lastResult.success 
              ? 'bg-green-600/20 border-green-500/30 text-green-300' 
              : 'bg-red-600/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              <span className="text-sm pixelated-text">{lastResult.message}</span>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 pixelated-text">
          <p>• Test different notification types</p>
          <p>• Check your notification dropdown</p>
          <p>• Real-time updates via Pusher</p>
        </div>
      </CardContent>
    </Card>
  );
}
