"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Loader2, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface ConnectWalletProps {
  onConnect?: (address: string) => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const { user, isLoading, createAccount } = useAuth()

  const handleAccountCreation = async () => {
    if (!user?.address) return
    
    try {
      await createAccount()
      onConnect?.(user.address)
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  return (
    <div className="space-y-6">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          const ready = mounted
          const connected = ready && account && chain

          if (!ready) {
            return (
              <Button 
                size="lg"
                disabled
                className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl border-0 pixelated-text"
              >
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Loading...
              </Button>
            )
          }

          if (connected) {
            return (
              <div className="space-y-4">
                <Button
                  onClick={openAccountModal}
                  size="lg"
                  className="group bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl border-0 pixelated-text"
                >
                  {account.displayName}
                </Button>
                
                {!user?.account && (
                  <Button
                    onClick={handleAccountCreation}
                    disabled={isLoading}
                    size="lg"
                    variant="outline"
                    className="group bg-white/10 border-white/30 text-white backdrop-blur-sm pixelated-text"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-3" />
                        Create Base Account
                      </>
                    )}
                  </Button>
                )}
              </div>
            )
          }

          return (
            <Button 
              onClick={openConnectModal}
              size="lg"
              className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl border-0 pixelated-text"
            >
              Connect Base Wallet
            </Button>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}
