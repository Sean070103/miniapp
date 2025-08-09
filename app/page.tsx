"use client"

import { useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import Dashboard from "@/components/dashboard"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  const { user } = useAuth()
  const { setFrameReady, isFrameReady } = useMiniKit()

  // Handle MiniKit frame readiness
  useEffect(() => {
    // Set frame ready immediately when component mounts
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  if (user?.isConnected) {
    return <Dashboard address={user.address} />
  }

  return <LandingPage onConnect={() => {}} />
}
