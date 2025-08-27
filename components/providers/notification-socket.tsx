"use client"

import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { useSocket } from '@/hooks/use-socket'

export default function NotificationSocket() {
  const { user } = useAuth()
  const { toast } = useToast()
  const walletAddress = user?.account?.walletAddress

  useSocket({
    userId: walletAddress,
    onNotification: (notification: any) => {
      toast({
        title: notification?.title || 'Notification',
        description: notification?.message || '',
        duration: 4000
      })
    }
  })

  return null
}


