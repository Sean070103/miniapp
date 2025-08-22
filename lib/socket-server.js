const SocketIOServer = require('socket.io').Server

// Store user connections
const userConnections = new Map()

function initSocketServer(server) {
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
    socket.on('authenticate', (userId) => {
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
function sendNotificationToUser(userId, notification) {
  const io = global.io
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification)
    return true
  }
  return false
}

// Function to broadcast notification to multiple users
function broadcastNotification(userIds, notification) {
  const io = global.io
  if (io) {
    userIds.forEach((userId) => {
      io.to(`user:${userId}`).emit('notification', notification)
    })
    return userIds.length
  }
  return 0
}

module.exports = {
  initSocketServer,
  sendNotificationToUser,
  broadcastNotification
}

