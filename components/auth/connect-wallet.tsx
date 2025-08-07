"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Wallet, Loader2, ArrowRight, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
                className="group bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border-0"
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
                  className="group bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 border-0"
                >
                  <Wallet className="w-5 h-5 mr-3" />
                  {account.displayName}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                
                {!user?.account && (
                  <Button
                    onClick={handleAccountCreation}
                    disabled={isLoading}
                    size="lg"
                    variant="outline"
                    className="group bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
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
              className="group bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border-0"
            >
              <Wallet className="w-5 h-5 mr-3" />
              Connect Base Wallet
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          )
        }}
      </ConnectButton.Custom>
      
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <Badge variant="outline" className="glass-effect px-4 py-2 text-white border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
          Coinbase Wallet
        </Badge>
      </div>
      <p className="text-base text-blue-200 text-center max-w-lg mx-auto leading-relaxed">
        Only Coinbase Wallet is supported. Your Base wallet becomes your identity. All entries are securely linked to your address.
      </p>
    </div>
  )
}
