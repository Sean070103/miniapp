"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, User, Users, Loader2 } from 'lucide-react'

interface User {
  id: string
  username: string
  walletAddress: string
  profilePicture?: string
  bio?: string
  dateCreated: string
}

interface UserSearchProps {
  onUserSelect?: (user: User) => void
  placeholder?: string
}

export function UserSearch({ onUserSelect, placeholder = "Search users..." }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/baseuser/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
      setHasSearched(true)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleUserClick = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user)
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
          <Search className="w-5 h-5" />
          Search Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        )}

        {!isLoading && hasSearched && users.length === 0 && searchQuery.trim() && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No users found</p>
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-600/50 cursor-pointer transition-colors"
              >
                <Avatar className="w-10 h-10 ring-2 ring-blue-400/20">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">
                      @{user.username}
                    </span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs">
                      Member
                    </Badge>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-slate-400 truncate">
                      {user.bio}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/10"
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
