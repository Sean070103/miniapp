"use client"

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={config.chains}
          initialChain={config.chains[0]}
          locale="en-US"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
