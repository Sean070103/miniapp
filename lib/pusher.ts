import Pusher from 'pusher'

let pusherClient: Pusher | null = null

export function getPusher(): Pusher | null {
  if (pusherClient) return pusherClient

  const appId = process.env.PUSHER_APP_ID || '2042361'
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '8676774bd4a6cbf36ea1'
  const secret = process.env.PUSHER_SECRET || '61b1b054666573688710'
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1'

  if (!appId || !key || !secret || !cluster) {
    console.warn('Pusher configuration missing, using fallback values')
  }

  pusherClient = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true
  })

  return pusherClient
}


