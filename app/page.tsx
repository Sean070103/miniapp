"use client"

import { useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import Dashboard from "@/components/dashboard"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  const { user } = useAuth()
  
  // Check if MiniKit is available
  const hasMiniKit = process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY && 
                     process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY !== 'your_minikit_api_key_here';
  
  // Only use MiniKit if it's properly configured
  const miniKitHook = hasMiniKit ? useMiniKit() : null;
  const { setFrameReady, isFrameReady } = miniKitHook || { setFrameReady: () => {}, isFrameReady: false };

  // Handle MiniKit frame readiness only if MiniKit is available
  useEffect(() => {
    if (hasMiniKit && !isFrameReady) {
      setFrameReady();
    }
  }, [hasMiniKit, setFrameReady, isFrameReady]);

  if (user?.isConnected) {
    return <Dashboard address={user.address} />
  }

  return <LandingPage onConnect={() => {}} />
}
