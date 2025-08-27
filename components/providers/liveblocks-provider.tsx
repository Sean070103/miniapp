"use client"

import { LiveblocksProvider } from '@liveblocks/react'
import { ReactNode } from 'react'

interface Props { children: ReactNode }

export default function LBProvider({ children }: Props) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
  if (!publicApiKey) return <>{children}</>
  return (
    <LiveblocksProvider publicApiKey={publicApiKey} throttle={16}>
      {children}
    </LiveblocksProvider>
  )
}


