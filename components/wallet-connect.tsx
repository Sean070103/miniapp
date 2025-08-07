"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2, ArrowRight, Shield } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface WalletConnectProps {
  onConnect: (address: string) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = "0x1234...5678"
      localStorage.setItem("wallet-connected", "true")
      localStorage.setItem("wallet-address", mockAddress)
      onConnect(mockAddress)
      setIsConnecting(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
        size="lg"
        className="group bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border-0"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Connecting to Base...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5 mr-3" />
            Connect Base Wallet
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Badge variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-300">
          <Shield className="w-3 h-3 mr-1" />
          Base Network
        </Badge>
        <Badge variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-300">
          Coinbase Wallet
        </Badge>
        <Badge variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white/20 transition-colors duration-300">
          MetaMask
        </Badge>
      </div>
      
      <p className="text-sm text-blue-200 text-center max-w-md mx-auto">
        Your Base wallet becomes your identity. All entries are securely linked to your address.
      </p>
    </div>
  )
}
