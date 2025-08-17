"use client"

import { useState, useMemo } from 'react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { base } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'

interface WalletProviderProps {
  children: React.ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  // Create wagmi config inside component to prevent hydration issues
  const config = useMemo(() => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd9'
    
    // Use getDefaultWallets for the latest RainbowKit setup
    const { wallets } = getDefaultWallets({
      appName: 'DailyBase',
      projectId,
    })

    const connectors = connectorsForWallets(wallets, { appName: 'DailyBase', projectId })

    return createConfig({
      chains: [base],
      connectors,
      transports: {
        [base.id]: http(),
      },
    })
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          showRecentTransactions={false}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
