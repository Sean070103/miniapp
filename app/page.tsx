"use client"

import { useEffect } from 'react'
import { useAuth } from "@/contexts/auth-context"
import Dashboard from "@/components/dashboard"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  const { user } = useAuth()
  
  // Check if MiniKit is available
  const hasMiniKit = process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY && 
                     process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY !== 'your_minikit_api_key_here';
  
  // Handle MiniKit frame readiness only if MiniKit is available
  useEffect(() => {
    if (hasMiniKit) {
      // MiniKit will be handled by the provider if available
      console.log('MiniKit is configured and will be handled by provider');
    }
  }, [hasMiniKit]);

  if (user?.isConnected) {
    return <Dashboard address={user.address} />
  }

  return <LandingPage onConnect={() => {}} />
}
