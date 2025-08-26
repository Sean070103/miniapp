"use client"

import { useEffect, useRef, useState } from 'react'
import Pusher, { type Channel } from 'pusher-js'

interface UseSocketOptions {
  userId?: string
  onNotification?: (notification: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useSocket({
  userId,
  onNotification,
  onConnect,
  onDisconnect
}: UseSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<Channel | null>(null)

  useEffect(() => {
    if (!userId) return

    setIsConnecting(true)

    // Initialize Pusher
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    if (!key || !cluster) return

    setIsConnecting(true)
    const pusher = new Pusher(key, { cluster, forceTLS: true })
    pusherRef.current = pusher

<<<<<<< HEAD
    // Subscribe to the "notifications" channel
    const channel = pusher.subscribe('notifications')
=======
    const channelName = `user-${userId}`
    const channel = pusher.subscribe(channelName)
>>>>>>> 920b2d6 (feat: integrate Pusher for real-time notifications and update socket server implementation)
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()
    })

<<<<<<< HEAD
    // Listen for "like" events
    channel.bind('like', (data: any) => {
      console.log('Received like event:', data);
      // Only show notification if it's for the current user
      if (data.recipientId === userId) {
        onNotification?.({
          id: `like-${Date.now()}`,
          type: 'like',
          title: 'New Like',
          message: 'Someone liked your post',
          isRead: false,
          dateCreated: new Date(),
          data: data
        });
      }
=======
    channel.bind('notification', (notification: any) => {
      onNotification?.(notification)
>>>>>>> 920b2d6 (feat: integrate Pusher for real-time notifications and update socket server implementation)
    })

    pusher.connection.bind('error', () => {
      setIsConnecting(false)
    })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
<<<<<<< HEAD
        try { pusherRef.current?.unsubscribe('notifications') } catch {}
=======
        try { pusherRef.current?.unsubscribe(`user-${userId}`) } catch {}
>>>>>>> 920b2d6 (feat: integrate Pusher for real-time notifications and update socket server implementation)
      }
      if (pusherRef.current) {
        try { pusherRef.current.disconnect() } catch {}
      }
    }
  }, [userId, onNotification, onConnect, onDisconnect])

  // Send ping to keep connection alive
  useEffect(() => {
    // no-op for Pusher
    return
  }, [isConnected])

  const sendMessage = (event: string, data: any) => {
    return false
  }

  return {
    isConnected,
    isConnecting,
    sendMessage,
    socket: pusherRef.current
  }
}


