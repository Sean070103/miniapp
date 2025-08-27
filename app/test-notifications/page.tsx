"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useSocket } from '@/hooks/use-socket'
import { useToast } from '@/components/ui/use-toast'
import { RealTimeNotificationTest } from '@/components/ui/real-time-notification-test'

export default function TestNotificationsPage() {
  const { user, createAccount } = useAuth()
  const { toast } = useToast()
  const [socketStatus, setSocketStatus] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])

  // Get baseuser ID from user account
  const baseUserId = user?.account?.id

  // Real-time notifications
  const { isConnected: isSocketConnected } = useSocket({
    userId: baseUserId,
    onNotification: (notification) => {
      console.log('Test page received notification:', notification)
      setTestResults(prev => [{
        type: 'received',
        notification,
        timestamp: new Date().toISOString()
      }, ...prev])
      
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000
      })
    },
    onConnect: () => {
      console.log('Test page: Socket connected')
      setTestResults(prev => [{
        type: 'connected',
        message: 'Socket connected successfully',
        timestamp: new Date().toISOString()
      }, ...prev])
    },
    onDisconnect: () => {
      console.log('Test page: Socket disconnected')
      setTestResults(prev => [{
        type: 'disconnected',
        message: 'Socket disconnected',
        timestamp: new Date().toISOString()
      }, ...prev])
    }
  })

  const checkSocketStatus = async () => {
    if (!baseUserId) return

    try {
      const response = await fetch(`/api/test-notifications?userId=${baseUserId}`)
      const data = await response.json()
      setSocketStatus(data)
      setTestResults(prev => [{
        type: 'status_check',
        data,
        timestamp: new Date().toISOString()
      }, ...prev])
    } catch (error) {
      console.error('Error checking socket status:', error)
      setTestResults(prev => [{
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }, ...prev])
    }
  }

  const sendTestNotification = async () => {
    if (!baseUserId) return

    try {
      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: baseUserId,
          senderId: 'test-sender-id',
          postId: 'test-post-id'
        })
      })
      const data = await response.json()
      setTestResults(prev => [{
        type: 'sent',
        data,
        timestamp: new Date().toISOString()
      }, ...prev])
    } catch (error) {
      console.error('Error sending test notification:', error)
      setTestResults(prev => [{
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      }, ...prev])
    }
  }

  useEffect(() => {
    if (baseUserId) {
      checkSocketStatus()
    }
  }, [baseUserId])

  if (!user?.isConnected) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Test</CardTitle>
          </CardHeader>
                  <CardContent>
          <p>Please connect your wallet to test notifications.</p>
        </CardContent>
      </Card>

      <RealTimeNotificationTest />
    </div>
  )
}

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Connection Status</h3>
              <p>Socket Connected: {isSocketConnected ? '✅ Yes' : '❌ No'}</p>
              <p>Wallet Connected: {user?.isConnected ? '✅ Yes' : '❌ No'}</p>
              <p>Wallet Address: {user?.address || 'Not available'}</p>
              <p>User ID: {baseUserId || 'Not available (need to create account)'}</p>
              <p>Account Created: {user?.account ? '✅ Yes' : '❌ No'}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Actions</h3>
              <div className="space-y-2">
                <Button onClick={checkSocketStatus} variant="outline" size="sm">
                  Check Status
                </Button>
                {!user?.account && (
                  <Button onClick={createAccount} size="sm" variant="secondary">
                    Create Account
                  </Button>
                )}
                <Button onClick={sendTestNotification} size="sm" disabled={!baseUserId}>
                  Send Test Notification
                </Button>
              </div>
            </div>
          </div>

          {socketStatus && (
            <div>
              <h3 className="font-semibold mb-2">Socket Status</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(socketStatus, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="border p-2 rounded">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{result.type}</span>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
                {result.message && <p className="text-sm">{result.message}</p>}
                {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                {result.data && (
                  <pre className="text-xs bg-gray-50 p-1 rounded mt-1 overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
                {result.notification && (
                  <div className="text-xs bg-blue-50 p-1 rounded mt-1">
                    <p><strong>Title:</strong> {result.notification.title}</p>
                    <p><strong>Message:</strong> {result.notification.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
