"use client"

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

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
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    setIsConnecting(true)

    // Get the correct server URL for production/development
    const getServerUrl = () => {
      // In production, use the same origin if NEXT_PUBLIC_APP_URL is not set
      if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_APP_URL || 
               process.env.NEXT_PUBLIC_URL || 
               window.location.origin
      }
      return process.env.NEXT_PUBLIC_APP_URL || 
             process.env.NEXT_PUBLIC_URL || 
             'http://localhost:3000'
    }

    const serverUrl = getServerUrl()
    console.log('Connecting to Socket.IO server:', serverUrl)

    // Initialize socket connection
    const socket = io(serverUrl, {
      path: '/api/socketio',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully')
      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()

      // Authenticate user
      socket.emit('authenticate', userId)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
      onDisconnect?.()
    })

    socket.on('authenticated', (data) => {
      console.log('User authenticated with socket:', data)
    })

    // Notification events
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification)
      onNotification?.(notification)
    })

    // Error handling
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnecting(false)
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log('Cleaning up socket connection')
        socket.disconnect()
      }
    }
  }, [userId, onNotification, onConnect, onDisconnect])

  // Send ping to keep connection alive
  useEffect(() => {
    if (!isConnected || !socketRef.current) return

    const pingInterval = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping')
      }
    }, 30000) // Ping every 30 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected])

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
      return true
    }
    return false
  }

  return {
    isConnected,
    isConnecting,
    sendMessage,
    socket: socketRef.current
  }
}


