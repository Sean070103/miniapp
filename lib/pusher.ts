import Pusher from 'pusher'

let pusherClient: Pusher | null = null

export function getPusher(): Pusher | null {
  if (pusherClient) return pusherClient

  const appId = process.env.PUSHER_APP_ID
  const key = process.env.PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.PUSHER_CLUSTER

  if (!appId || !key || !secret || !cluster) {
    console.warn('Pusher configuration missing, returning null')
    return null
  }

  try {
    pusherClient = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true,
      // Production-ready configuration
      timeout: 30000, // 30 second timeout
      keepAlive: true, // Keep connection alive
      // Encryption settings for production
      encryptionMasterKeyBase64: process.env.PUSHER_ENCRYPTION_MASTER_KEY,
    })

    console.log('Pusher client initialized successfully for production')
    return pusherClient
  } catch (error) {
    console.error('Error initializing Pusher client:', error)
    return null
  }
}

// Helper function to safely trigger events with error handling
export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: any,
  options?: { socketId?: string }
): Promise<boolean> {
  try {
    const pusher = getPusher()
    if (!pusher) {
      console.error('Pusher client not available')
      return false
    }

    await pusher.trigger(channel, event, data, options)
    console.log(`Pusher event triggered: ${channel}:${event}`)
    return true
  } catch (error) {
    console.error('Error triggering Pusher event:', error)
    return false
  }
}


