import { Server as SocketIOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'

// Store user connections
const userConnections = new Map<string, string>()

function initSocketServer(server: HTTPServer) {
  // Get the correct origin for CORS
  const allowedOrigins: (string | RegExp)[] = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter((origin): origin is string => typeof origin === 'string')

  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle user authentication
    socket.on('authenticate', (userId: string) => {
      if (userId) {
        userConnections.set(userId, socket.id)
        socket.join(`user:${userId}`)
        console.log(`User ${userId} authenticated with socket ${socket.id}`)
        
        socket.emit('authenticated', { success: true })
      }
    })

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`)
      // Remove user from connections
      for (const [userId, socketId] of userConnections.entries()) {
        if (socketId === socket.id) {
          userConnections.delete(userId)
          console.log(`User ${userId} disconnected`)
          break
        }
      }
    })

    // Handle connection errors
    socket.on('error', (error: Error) => {
      console.error('Socket error:', error)
    })
  })

  return io
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data: string | null;
  isRead: boolean;
  dateCreated: Date;
  sender?: {
    id: string;
    username: string | null;
    walletAddress: string;
    profilePicture: string | null;
  };
}

// Function to send notification to specific user
function sendNotificationToUser(userId: string, notification: NotificationData) {
  const io = (global as { io?: any }).io
  if (io && userId) {
    try {
      io.to(`user:${userId}`).emit('notification', notification)
      console.log(`Notification sent to user ${userId}:`, notification.title)
      return true
    } catch (error) {
      console.error('Error sending notification to user:', error)
      return false
    }
  }
  console.warn('Socket.IO not available or userId missing for notification')
  return false
}

// Function to broadcast notification to multiple users
function broadcastNotification(userIds: string[], notification: NotificationData) {
  const io = (global as { io?: any }).io
  if (io && userIds && userIds.length > 0) {
    try {
      userIds.forEach((userId) => {
        if (userId) {
          io.to(`user:${userId}`).emit('notification', notification)
        }
      })
      console.log(`Broadcast notification sent to ${userIds.length} users`)
      return userIds.length
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      return 0
    }
  }
  return 0
}

export {
  initSocketServer,
  sendNotificationToUser,
  broadcastNotification
}
