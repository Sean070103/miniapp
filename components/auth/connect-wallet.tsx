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
    <div className="space-responsive-sm">
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
                className="group bg-white/90 text-slate-900 font-semibold rounded-xl sm:rounded-2xl shadow-responsive-lg border border-white/60 pixelated-text w-[260px] sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base hover:bg-white"
              >
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" />
                Loading...
              </Button>
            )
          }

          if (connected) {
            return (
              <div className="space-responsive-sm">
                <Button
                  onClick={openAccountModal}
                  size="default"
                  className="group bg-white/90 text-slate-900 font-semibold rounded-xl sm:rounded-2xl shadow-responsive-lg border border-white/60 pixelated-text w-[260px] sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base hover:bg-white"
                >
                  {account.displayName}
                </Button>
                
                {!user?.account && (
                  <Button
                    onClick={handleAccountCreation}
                    disabled={isLoading}
                    size="default"
                    variant="outline"
                    className="group bg-white/90 text-slate-900 border-white/60 pixelated-text rounded-xl sm:rounded-2xl w-[260px] sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base hover:bg-white"
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
              className="group bg-transparent text-white font-semibold rounded-xl sm:rounded-2xl shadow-responsive-lg border border-white/70 pixelated-text w-[260px] sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base hover:bg-white/10"
              style={{ color: '#FFFFFF' }}
            >
              Connect Base Wallet
            </Button>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}


