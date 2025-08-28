"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const pusherRef = useRef<Pusher | null>(null)
  const channelRef = useRef<Channel | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!userId) return

    // Clean up existing connection
    if (pusherRef.current) {
      try {
        pusherRef.current.disconnect()
      } catch (error) {
        console.warn('Error disconnecting existing Pusher connection:', error)
      }
    }

    setIsConnecting(true)
    setConnectionError(null)

    // Initialize Pusher with production-ready configuration
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!key || !cluster) {
      const error = 'Pusher configuration missing'
      console.error(error)
      setConnectionError(error)
      setIsConnecting(false)
      return
    }

    try {
      const pusher = new Pusher(key, {
        cluster,
        forceTLS: true,
        // Production-ready configuration
        enabledTransports: ['ws', 'wss'], // Prefer WebSocket over HTTP
        disabledTransports: ['xhr_streaming', 'xhr_polling'], // Disable HTTP fallbacks for better performance
        // Connection timeout and retry settings
        activityTimeout: 30000, // 30 seconds
        pongTimeout: 15000, // 15 seconds
        // Enable automatic reconnection
        enableStats: false, // Disable stats for production
      })

      pusherRef.current = pusher

      const channelName = `user-${userId.toLowerCase()}`
      const channel = pusher.subscribe(channelName)
      channelRef.current = channel

      // Connection event handlers
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('Pusher connected successfully for user:', userId)
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
        onConnect?.()
      })

      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('Pusher subscription error:', error)
        setConnectionError(`Subscription failed: ${error.message || 'Unknown error'}`)
        setIsConnecting(false)
        setIsConnected(false)
      })

      // Notification event handler
      channel.bind('notification', (notification: any) => {
        console.log('Notification received:', notification)
        onNotification?.(notification)
      })

      // Connection state handlers
      pusher.connection.bind('connected', () => {
        console.log('Pusher connection established')
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionError(null)
      })

      pusher.connection.bind('disconnected', () => {
        console.log('Pusher connection disconnected')
        setIsConnected(false)
        setIsConnecting(false)
        onDisconnect?.()
      })

      pusher.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error)
        setConnectionError(`Connection error: ${error.message || 'Unknown error'}`)
        setIsConnecting(false)
        setIsConnected(false)
      })

      // Auto-reconnection logic
      pusher.connection.bind('state_change', (states: any) => {
        console.log('Pusher state change:', states)
        
        if (states.current === 'disconnected' && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff, max 30s
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
            connect()
          }, delay)
        }
      })

    } catch (error) {
      console.error('Error initializing Pusher:', error)
      setConnectionError(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsConnecting(false)
    }
  }, [userId, onConnect, onDisconnect, onNotification])

  useEffect(() => {
    connect()

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (channelRef.current && pusherRef.current) {
        try {
          pusherRef.current.unsubscribe(`user-${userId}`)
        } catch (error) {
          console.warn('Error unsubscribing from channel:', error)
        }
      }
      
      if (pusherRef.current) {
        try {
          pusherRef.current.disconnect()
        } catch (error) {
          console.warn('Error disconnecting Pusher:', error)
        }
      }
    }
  }, [connect])

  const sendMessage = (event: string, data: any) => {
    return false
  }

  return {
    isConnected,
    isConnecting,
    connectionError,
    sendMessage,
    socket: pusherRef.current
  }
}


