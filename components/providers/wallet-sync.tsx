"use client"

import { useEffect, useRef } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAuth } from '@/contexts/auth-context'

export function WalletSync() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { user, setUser, logout } = useAuth()
  
  // Use refs to track previous values and prevent infinite loops
  const prevAddress = useRef<string | undefined>()
  const prevIsConnected = useRef<boolean>()

  // Sync wallet connection state with auth context
  useEffect(() => {
    // Only update if values actually changed
    if (isConnected && address && (prevAddress.current !== address || prevIsConnected.current !== isConnected)) {
      const newUser = {
        address,
        isConnected: true
      }
      setUser(newUser)
      localStorage.setItem('cryptojournal-user', JSON.stringify(newUser))
      
      // Update refs
      prevAddress.current = address
      prevIsConnected.current = isConnected
    } else if (!isConnected && user && prevIsConnected.current !== isConnected) {
      logout()
      prevIsConnected.current = isConnected
    }
  }, [isConnected, address, setUser, logout, user])

  // Set up enhanced logout function
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).enhancedLogout = () => {
        disconnect()
        logout()
      }
    }
  }, [disconnect, logout])

  return null // This component doesn't render anything
}
