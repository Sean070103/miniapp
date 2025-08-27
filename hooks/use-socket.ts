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

    // Subscribe to the "notifications" channel
    const channel = pusher.subscribe('notifications')
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()
    })

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
    })

    pusher.connection.bind('error', () => {
      setIsConnecting(false)
    })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        try { pusherRef.current?.unsubscribe('notifications') } catch {}
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


