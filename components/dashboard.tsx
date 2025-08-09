"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Settings, User, Shield, Copy, Check, Calendar, Flame, Target, BookOpen, Plus, MessageSquare, Heart, Share2 } from 'lucide-react'
import { UserProfile } from "@/components/auth/user-profile"
import { DailyEntry } from "@/components/dashboard/daily-entry"
import { CalendarView } from "@/components/dashboard/calendar-view"
import { StreakTracker } from "@/components/dashboard/streak-tracker"
import { ContributionGrid } from "@/components/dashboard/contribution-grid"
import { useAuth } from "@/contexts/auth-context"

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface DashboardProps {
  address: string
}

export default function Dashboard({ address }: DashboardProps) {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<string>()
  const [copied, setCopied] = useState(false)

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem(`dailybase-entries-${address}`)
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error('Error loading entries:', error)
      }
    }
  }, [address])

  // Save entries to localStorage
  const saveEntry = (entry: DailyEntry) => {
    const updatedEntries = entries.filter(e => e.date !== entry.date)
    const newEntries = [...updatedEntries, entry].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    setEntries(newEntries)
    localStorage.setItem(`dailybase-entries-${address}`, JSON.stringify(newEntries))
  }

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0]
    return entries.find(entry => entry.date === today)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const getAddressDisplay = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setShowProfile(false)}
              variant="outline"
              className="mb-6 bg-slate-800 border-slate-600 text-white pixelated-text"
            >
              ← Back to Feed
            </Button>
            <UserProfile />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* System-themed Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.2) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 80px 80px, 80px 80px'
          }}></div>
        </div>
        
        {/* Digital grid lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 shadow-lg border-2 border-blue-400">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                  <BookOpen className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-white pixelated-text">DailyBase</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-slate-800 border-blue-400 text-blue-300 shadow-sm pixelated-text">
                    <Wallet className="w-4 h-4 mr-2" />
                    {getAddressDisplay(address)}
                  </Badge>
                  {user?.account && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 pixelated-text">
                      <Shield className="w-4 h-4 mr-2" />
                      Base Account
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowProfile(true)}
              variant="outline"
              className="bg-slate-800 border-slate-600 text-white shadow-sm pixelated-text"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Farcaster-like Feed Layout */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-300 pixelated-text">Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakTracker entries={entries} />
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-300 pixelated-text">Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContributionGrid entries={entries} />
                </CardContent>
              </Card>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create New Post */}
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-300 flex items-center gap-2 pixelated-text">
                    <Plus className="w-5 h-5" />
                    New Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyEntry onSave={saveEntry} todayEntry={getTodayEntry()} />
                </CardContent>
              </Card>

              {/* Feed Posts */}
              {entries.slice(0, 5).map((entry) => (
                <Card key={entry.id} className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                            {entry.date.slice(-2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-white pixelated-text">DailyBase</div>
                          <div className="text-sm text-blue-300 pixelated-text">{new Date(entry.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="text-blue-300 pixelated-text">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-300 pixelated-text">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-300 pixelated-text">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white leading-relaxed mb-4 pixelated-text">{entry.content}</p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Sidebar - Calendar */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-300 pixelated-text">Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarView 
                    entries={entries} 
                    onDateSelect={setSelectedDate}
                    selectedDate={selectedDate}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
