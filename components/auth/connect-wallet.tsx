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
    <div className="space-y-4 sm:space-y-6">
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
                size="default"
                disabled
                className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-0 pixelated-text text-sm sm:text-base"
              >
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                Loading...
              </Button>
            )
          }

          if (connected) {
            return (
              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={openAccountModal}
                  size="default"
                  className="group bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-0 pixelated-text text-sm sm:text-base"
                >
                  {account.displayName}
                </Button>
                
                {!user?.account && (
                  <Button
                    onClick={handleAccountCreation}
                    disabled={isLoading}
                    size="default"
                    variant="outline"
                    className="group bg-white/10 border-white/30 text-white backdrop-blur-sm pixelated-text px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
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
              size="default"
              className="group bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold px-4 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border-0 pixelated-text text-sm sm:text-base"
            >
              Connect Base Wallet
            </Button>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}


