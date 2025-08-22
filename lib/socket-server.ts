import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

export type NextApiResponseServerIO = any & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

// Store user connections
const userConnections = new Map<string, string>()

export function initSocketServer(server: NetServer) {
  const io = new SocketIOServer(server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle user authentication
    socket.on('authenticate', (userId: string) => {
      userConnections.set(userId, socket.id)
      socket.join(`user:${userId}`)
      console.log(`User ${userId} authenticated with socket ${socket.id}`)
      
      socket.emit('authenticated', { success: true })
    })

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from connections
      for (const [userId, socketId] of userConnections.entries()) {
        if (socketId === socket.id) {
          userConnections.delete(userId)
          console.log(`User ${userId} disconnected`)
          break
        }
      }
    })
  })

  return io
}

// Function to send notification to specific user
export function sendNotificationToUser(userId: string, notification: any) {
  const io = (global as any).io
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification)
    return true
  }
  return false
}

// Function to broadcast notification to multiple users
export function broadcastNotification(userIds: string[], notification: any) {
  const io = (global as any).io
  if (io) {
    userIds.forEach(userId => {
      io.to(`user:${userId}`).emit('notification', notification)
    })
    return userIds.length
  }
  return 0
}

