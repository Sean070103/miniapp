"use client"

import { useAuth } from "@/contexts/auth-context"
import Dashboard from "@/components/dashboard"
import { LandingPage } from "@/components/landing/landing-page"

export default function HomePage() {
  const { user } = useAuth()

  if (user?.isConnected) {
    return <Dashboard address={user.address} />
  }

  return <LandingPage onConnect={() => {}} />
}
