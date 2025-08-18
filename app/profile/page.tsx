"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  User, 
  Wallet, 
  Shield, 
  Copy, 
  Check, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Calendar,
  Flame,
  Target,
  BookOpen,
  BarChart3,
  Bell,
  Moon,
  Sun,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Activity,
  Award,
  TrendingUp,
  Clock,
  Star,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [entries, setEntries] = useState<DailyEntry[]>([])
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: 'DailyBase User',
    bio: 'Crypto enthusiast and DailyBase user',
    email: '',
    website: '',
    location: '',
    timezone: 'UTC'
  })
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: true,
    autoSave: true,
    publicProfile: false,
    showStats: true
  })

  // Load entries from database
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/journal/get')
        if (response.ok) {
          const data = await response.json()
          // Convert database posts to DailyEntry format
          const fetchedEntries: DailyEntry[] = data.map((post: any) => ({
            id: post.id,
            date: new Date(post.dateCreated).toISOString().split('T')[0],
            content: post.journal,
            tags: post.tags || [],
            timestamp: new Date(post.dateCreated).getTime()
          }))
          setEntries(fetchedEntries)
        }
      } catch (error) {
        console.error('Error fetching entries:', error)
        // Fallback to localStorage if API fails
    if (user?.address) {
      const savedEntries = localStorage.getItem(`dailybase-entries-${user.address}`)
      if (savedEntries) {
          setEntries(JSON.parse(savedEntries))
          }
        }
      }
    }

    if (user?.address) {
    fetchEntries()
    }
  }, [user?.address])

  const copyAddress = () => {
    if (user?.address) {
      navigator.clipboard.writeText(user.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const exportData = () => {
    const data = {
      profile: profileForm,
      preferences,
      entries,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dailybase-profile-${user?.address?.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setEntries([])
      if (user?.address) {
        localStorage.removeItem(`dailybase-entries-${user.address}`)
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-responsive-md">
          <h1 className="text-responsive-2xl font-bold text-white pixelated-text">
            Please connect your wallet
          </h1>
          <p className="text-blue-300 pixelated-text text-responsive-base">
            You need to connect your wallet to view your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header with responsive design */}
      <div className="container-mobile py-responsive-md">
        <div className="flex items-center justify-between mb-responsive-lg">
          <div className="flex items-center space-responsive-sm">
            <Link href="/" className="text-blue-300 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </Link>
            <h1 className="text-responsive-xl sm:text-responsive-2xl font-bold text-white pixelated-text">
              Profile
            </h1>
          </div>
                <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-500 hover:bg-blue-600 text-white pixelated-text touch-friendly"
                >
            {isEditing ? 'Save' : 'Edit'}
                </Button>
        </div>

        {/* Enhanced Profile Content with responsive grid */}
        <div className="grid-responsive-1 lg:grid-responsive-2 gap-responsive-lg">
          {/* Enhanced Profile Information */}
          <div className="space-responsive-md">
            <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
              <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text text-responsive-lg">
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-responsive-md">
                {/* Enhanced Wallet Address Section */}
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Wallet Address</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs font-mono">
                        {user.address}
                      </p>
              </div>
            </div>
                  <Button
                    onClick={copyAddress}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white pixelated-text touch-friendly"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
          </div>

                {/* Enhanced Profile Form with responsive inputs */}
                <div className="space-responsive-sm">
                  <div>
                    <label className="block text-white pixelated-text text-responsive-sm font-medium mb-2">
                      Display Name
                    </label>
                      <Input
                        value={profileForm.displayName}
                        onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700 border-slate-600 text-white pixelated-text form-mobile-input touch-friendly"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white pixelated-text text-responsive-sm font-medium mb-2">
                      Bio
                    </label>
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700 border-slate-600 text-white pixelated-text form-mobile-input touch-friendly"
                        rows={3}
                      />
                  </div>
                  
                  <div>
                    <label className="block text-white pixelated-text text-responsive-sm font-medium mb-2">
                      Email
                    </label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700 border-slate-600 text-white pixelated-text form-mobile-input touch-friendly"
                      />
                  </div>
                  
                  <div>
                    <label className="block text-white pixelated-text text-responsive-sm font-medium mb-2">
                      Website
                    </label>
                      <Input
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700 border-slate-600 text-white pixelated-text form-mobile-input touch-friendly"
                      />
                  </div>
                  
                  <div>
                    <label className="block text-white pixelated-text text-responsive-sm font-medium mb-2">
                      Location
                    </label>
                      <Input
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                      disabled={!isEditing}
                      className="bg-slate-700 border-slate-600 text-white pixelated-text form-mobile-input touch-friendly"
                      />
                  </div>
                  </div>
                </CardContent>
              </Card>

            {/* Enhanced Statistics with responsive grid */}
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text text-responsive-lg">
                  Statistics
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="grid-responsive-2 gap-responsive-sm">
                  <div className="text-center p-responsive-sm bg-slate-700/50 rounded-lg">
                    <div className="text-responsive-2xl font-bold text-blue-400">{entries.length}</div>
                    <div className="text-responsive-xs text-blue-300 pixelated-text">Total Entries</div>
                  </div>
                  <div className="text-center p-responsive-sm bg-slate-700/50 rounded-lg">
                    <div className="text-responsive-2xl font-bold text-green-400">
                      {entries.length > 0 ? Math.floor((entries.length / 365) * 100) : 0}%
                    </div>
                    <div className="text-responsive-xs text-green-300 pixelated-text">Completion</div>
                  </div>
                    </div>
                </CardContent>
              </Card>
            </div>

          {/* Enhanced Settings and Preferences */}
          <div className="space-responsive-md">
            {/* Enhanced Preferences with responsive switches */}
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text text-responsive-lg">
                  Preferences
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-responsive-sm">
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Notifications</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                    />
                  </div>
                  
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Dark Mode</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Use dark theme</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                    />
                  </div>
                  
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Save className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Auto Save</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Automatically save drafts</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => setPreferences({...preferences, autoSave: checked})}
                    />
                  </div>
                  
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Public Profile</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Allow others to view your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.publicProfile}
                      onCheckedChange={(checked) => setPreferences({...preferences, publicProfile: checked})}
                    />
                  </div>
                  
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Show Statistics</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Display activity stats on profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={preferences.showStats}
                      onCheckedChange={(checked) => setPreferences({...preferences, showStats: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

            {/* Enhanced Data Management with responsive buttons */}
              <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
                <CardHeader>
                <CardTitle className="text-blue-300 pixelated-text text-responsive-lg flex items-center space-responsive-sm">
                  <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                    Data Management
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-responsive-sm">
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Export Data</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Download your profile and entries as JSON</p>
                      </div>
                    </div>
                    <Button
                      onClick={exportData}
                      variant="outline"
                    className="bg-slate-700 border-slate-600 text-white pixelated-text touch-friendly"
                    >
                      Export
                    </Button>
                  </div>
                  
                <div className="flex items-center justify-between p-responsive-sm bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-responsive-sm">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                      <div>
                      <h3 className="text-white pixelated-text font-semibold text-responsive-sm">Clear All Data</h3>
                      <p className="text-blue-300 pixelated-text text-responsive-xs">Remove all entries (irreversible)</p>
                      </div>
                    </div>
                    <Button
                      onClick={clearData}
                      variant="outline"
                    className="bg-red-600/20 border-red-500 text-red-300 pixelated-text hover:bg-red-600/30 touch-friendly"
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
