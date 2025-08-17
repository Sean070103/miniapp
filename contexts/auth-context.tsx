"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface User {
  address: string
  account?: any // Simplified for now
  isConnected: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isHydrated: boolean
  login: () => Promise<void>
  logout: () => void
  createAccount: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cryptojournal-user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('cryptojournal-user')
        }
      }
      setIsHydrated(true)
    }
  }, [])

  const login = useCallback(async () => {
    setIsLoading(true)
    try {
      // The actual connection will be handled by RainbowKit
      // This function is called after successful connection
      console.log('Login successful')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('cryptojournal-user')
  }, [])

  const createAccount = useCallback(async () => {
    if (!user?.address) {
      throw new Error('No wallet connected')
    }

    setIsLoading(true)
    try {
      // Create Base Account using the API
      const response = await fetch('/api/baseuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: user.address,
          username: null,
          email: null,
          profilePicture: null,
          bio: null
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Create Base Account - simplified for now
      const account = {
        address: user.address,
        type: 'base-account',
        id: result.data.id
      }

      const updatedUser: User = {
        ...user,
        account
      }

      setUser(updatedUser)
      localStorage.setItem('cryptojournal-user', JSON.stringify(updatedUser))
      
      console.log('Account created successfully:', result.data)
    } catch (error) {
      console.error('Account creation failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const value: AuthContextType = {
    user,
    isLoading,
    isHydrated,
    login,
    logout,
    createAccount,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
