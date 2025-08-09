"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Wallet, LogOut, User, Shield, Copy, Check } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'

export function UserProfile() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getAddressDisplay = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="border-0 shadow-xl glass-effect">
      <CardHeader className="pb-6">
        <CardTitle className="text-white flex items-center gap-3 text-2xl pixelated-text">
          <User className="w-6 h-6" />
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold shadow-glow">
              {user.address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-3 pixelated-text">
              {user.account ? 'Base Account' : 'Wallet Connected'}
            </h3>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="glass-effect border-white/30 text-white px-4 py-2 pixelated-text">
                <Wallet className="w-4 h-4 mr-2" />
                {getAddressDisplay(user.address)}
              </Badge>
              {user.account && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 pixelated-text">
                  <Shield className="w-4 h-4 mr-2" />
                  Base Account
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl glass-effect">
            <span className="text-blue-100 text-base font-medium pixelated-text">Full Address</span>
            <div className="flex items-center gap-3">
              <code className="text-white text-sm font-mono bg-white/10 px-3 py-1 rounded-lg pixelated-text">
                {user.address}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-10 w-10 p-0 text-white rounded-xl pixelated-text"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl glass-effect">
            <span className="text-blue-100 text-base font-medium pixelated-text">Network</span>
            <Badge variant="outline" className="glass-effect border-white/30 text-white px-4 py-2 pixelated-text">
              Base
            </Badge>
          </div>

          {user.account && (
            <div className="flex items-center justify-between p-4 rounded-2xl glass-effect">
              <span className="text-blue-100 text-base font-medium pixelated-text">Account Status</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 pixelated-text">
                Active
              </Badge>
            </div>
          )}
        </div>

        <Button
          onClick={() => {
            // Use the enhanced logout function if available
            if (typeof window !== 'undefined' && (window as any).enhancedLogout) {
              (window as any).enhancedLogout()
            } else {
              // Fallback to regular logout
              window.location.reload()
            }
          }}
          variant="outline"
          className="w-full bg-red-500/10 border-red-500/30 text-red-300 py-6 text-lg font-medium rounded-2xl pixelated-text"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  )
}
