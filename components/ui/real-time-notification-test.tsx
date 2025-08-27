"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'

interface Notification {
  id: string
  type: 'like' | 'repost' | 'comment' | 'follow'
  title: string
  message: string
  isRead: boolean
  dateCreated: Date
  data?: any
}

export function RealTimeNotificationTest() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const testLikeNotification = async () => {
    if (!user?.account?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated'
      })
      return
    }

    try {
      // Create a test notification by liking a post
      const response = await fetch('/api/like/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          journalId: 'test-journal-id', // This will fail but trigger the notification logic
          userId: user.account.id
        })
      })

      if (!response.ok) {
        // Even if the like fails, we can test the notification system
        console.log('Like test completed (expected to fail for test journal)')
      }
    } catch (error) {
      console.error('Test like error:', error)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }



  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Real-Time Notifications Test
          <Badge>Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Button onClick={testLikeNotification}>
            Test Like Notification
          </Button>
          <Button onClick={clearNotifications} variant="outline">
            Clear
          </Button>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Notifications:</h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-gray-600">{notification.message}</div>
                  <div className="text-gray-400">{new Date(notification.dateCreated).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
