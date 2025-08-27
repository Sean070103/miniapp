"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './use-socket'
import { useAuth } from '@/contexts/auth-context'

interface Notification {
  id: string
  type: 'like' | 'repost' | 'comment' | 'follow'
  title: string
  message: string
  isRead: boolean
  dateCreated: Date
  sender?: {
    id: string
    username?: string
    walletAddress: string
    profilePicture?: string
  }
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationIds?: string[]) => Promise<void>
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Notification) => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Prefer wallet address; fall back to internal id
  const baseUserId = (user as any)?.account?.walletAddress || (user as any)?.account?.id

  // Socket connection for real-time notifications
  const { isConnected: isSocketConnected } = useSocket({
    userId: baseUserId,
    onNotification: (notification) => {
      console.log('Received real-time notification:', notification)
      addNotification({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: false,
        dateCreated: new Date(notification.dateCreated),
        sender: notification.sender
      })
    },
    onConnect: () => {
      console.log('Socket connected for notifications')
    },
    onDisconnect: () => {
      console.log('Socket disconnected for notifications')
    }
  })

  const fetchNotifications = useCallback(async () => {
    if (!baseUserId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/notifications?userId=${baseUserId}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.map((n: any) => ({
          ...n,
          dateCreated: new Date(n.dateCreated)
        })))
      } else {
        setError(data.error || 'Failed to fetch notifications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }, [baseUserId])

  const markAsRead = useCallback(async (notificationIds?: string[]) => {
    if (!baseUserId) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: baseUserId,
          notificationIds
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({
            ...notification,
            isRead: notificationIds 
              ? notificationIds.includes(notification.id) 
              : true
          }))
        )
      } else {
        console.error('Failed to mark notifications as read:', data.error)
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err)
    }
  }, [baseUserId])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (baseUserId) {
      fetchNotifications()
    }
  }, [baseUserId, fetchNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    fetchNotifications,
    addNotification
  }
}
