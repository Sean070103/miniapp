"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { User, Camera, Check, X, Loader2 } from 'lucide-react'

interface UserRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
}

export function UserRegistrationModal({ isOpen, onClose, walletAddress }: UserRegistrationModalProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const { createAccount } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required"
      })
      return
    }

    setIsLoading(true)
    try {
      // Create user profile
      const response = await fetch('/api/baseuser/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          username: username.trim(),
          email: email.trim() || null,
          profilePicture,
          bio: bio.trim() || null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create profile')
      }

      toast({
        title: "Success",
        description: "Profile created successfully!"
      })
      onClose()
    } catch (error) {
      console.error('Registration failed:', error)
      toast({
        title: "Error",
        description: "Failed to create profile"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800/90 border-slate-600 text-white backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-white pixelated-text">
            Welcome to DailyBase! 🎮
          </CardTitle>
          <p className="text-blue-300 text-sm">
            Set up your profile to get started
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-sm text-slate-400 mb-1">Connected Wallet</div>
              <div className="font-mono text-sm text-blue-300">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Username *</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a unique username"
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                minLength={3}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email (Optional)</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Bio (Optional)</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 resize-none"
                rows={3}
                maxLength={200}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <User className="w-5 h-5 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
