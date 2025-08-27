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

    const channelName = `user-${userId.toLowerCase()}`
    const channel = pusher.subscribe(channelName)
    channelRef.current = channel

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()
    })

    channel.bind('notification', (notification: any) => {
      onNotification?.(notification)
    })

    pusher.connection.bind('error', () => {
      setIsConnecting(false)
    })

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        try { pusherRef.current?.unsubscribe(`user-${userId}`) } catch {}
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


