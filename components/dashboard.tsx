"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Wallet, Settings, User, Shield, Copy, Check, Calendar, Flame, Target, BookOpen } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={() => setShowProfile(false)}
              variant="outline"
              className="mb-6 bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
            >
              ← Back to Journal
            </Button>
            <UserProfile />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 shadow-lg">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold">
                <BookOpen className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Your Crypto Journal</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-white border-gray-300 text-gray-700 shadow-sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  {getAddressDisplay(address)}
                </Badge>
                {user?.account && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
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
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Journal Stats - move to left */}
          <div className="space-y-6 lg:col-span-1">
            <StreakTracker entries={entries} />
            <ContributionGrid entries={entries} />
          </div>

          {/* Daily Entry - move to right */}
          <div className="lg:col-span-2">
            <DailyEntry onSave={saveEntry} todayEntry={getTodayEntry()} />
          </div>
        </div>

        {/* Calendar View */}
        <div className="mt-8">
          <CalendarView 
            entries={entries} 
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  )
}
