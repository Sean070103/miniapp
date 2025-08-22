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

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      setIsConnecting(false)
      onConnect?.()

      // Authenticate user
      socket.emit('authenticate', userId)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
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

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [userId, onNotification, onConnect, onDisconnect])

  // Send ping to keep connection alive
  useEffect(() => {
    if (!isConnected || !socketRef.current) return

    const pingInterval = setInterval(() => {
      socketRef.current?.emit('ping')
    }, 30000) // Ping every 30 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected])

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data)
    }
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  return {
    isConnected,
    isConnecting,
    sendMessage,
    disconnect,
    socket: socketRef.current
  }
}

