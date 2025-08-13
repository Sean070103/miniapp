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
  Star
} from 'lucide-react'
import { useAuth } from "@/contexts/auth-context"

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface ProfilePageProps {
  address: string
  entries: DailyEntry[]
  onBack: () => void
}

export function ProfilePage({ address, entries, onBack }: ProfilePageProps) {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || 'DailyBase User',
    bio: user?.bio || 'Crypto enthusiast and DailyBase user',
    email: user?.email || '',
    website: user?.website || '',
    location: user?.location || '',
    timezone: user?.timezone || 'UTC'
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

  const saveProfile = () => {
    // Here you would typically save to backend
    console.log('Saving profile:', profileForm)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setProfileForm({
      displayName: user?.displayName || 'DailyBase User',
      bio: user?.bio || 'Crypto enthusiast and DailyBase user',
      email: user?.email || '',
      website: user?.website || '',
      location: user?.location || '',
      timezone: user?.timezone || 'UTC'
    })
    setIsEditing(false)
  }

  const exportData = () => {
    const data = {
      profile: profileForm,
      entries: entries,
      preferences: preferences,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dailybase-profile-${address.slice(0, 8)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.removeItem(`dailybase-entries-${address}`)
      window.location.reload()
    }
  }

  // Calculate statistics
  const totalEntries = entries.length
  const totalDays = entries.length > 0 ? Math.ceil(entries.length / 7) : 0
  const consistency = entries.length > 0 ? Math.round((entries.length / 30) * 100) : 0
  const currentStreak = entries.length > 0 ? Math.max(...entries.map((_, i) => i + 1)) : 0
  
  // Calculate longest streak
  const calculateLongestStreak = () => {
    if (entries.length === 0) return 0
    
    let longestStreak = 0
    let currentStreak = 0
    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    for (let i = 0; i < sortedEntries.length; i++) {
      if (i === 0) {
        currentStreak = 1
      } else {
        const prevDate = new Date(sortedEntries[i - 1].date)
        const currDate = new Date(sortedEntries[i].date)
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
    }
    
    return Math.max(longestStreak, currentStreak)
  }

  const longestStreak = calculateLongestStreak()

  // Get most used tags
  const getMostUsedTags = () => {
    const tagCounts: { [key: string]: number } = {}
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))
  }

  const mostUsedTags = getMostUsedTags()

  // Get recent activity
  const recentActivity = entries.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white pixelated-text"
          >
            ← Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white pixelated-text">Profile</h1>
            <p className="text-blue-300 pixelated-text">Manage your account and preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={saveProfile}
                className="bg-green-600 hover:bg-green-700 text-white pixelated-text"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white pixelated-text"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white pixelated-text"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-blue-400/20">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                  {profileForm.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-blue-300 pixelated-text text-xl">
                {isEditing ? (
                  <Input
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({...profileForm, displayName: e.target.value})}
                    className="text-center bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  profileForm.displayName
                )}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                  <Wallet className="w-3 h-3 mr-1" />
                  {getAddressDisplay(address)}
                </Badge>
                {user?.account && (
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text">
                    <Shield className="w-3 h-3 mr-1" />
                    Base Account
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-blue-300 pixelated-text">Bio</label>
                {isEditing ? (
                  <Textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                    rows={3}
                  />
                ) : (
                  <p className="text-white pixelated-text mt-1">{profileForm.bio}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-300 pixelated-text">Email</label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white pixelated-text mt-1">{profileForm.email || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-300 pixelated-text">Website</label>
                {isEditing ? (
                  <Input
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white pixelated-text mt-1">{profileForm.website || 'Not provided'}</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-300 pixelated-text">Location</label>
                {isEditing ? (
                  <Input
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    className="mt-1 bg-slate-700 border-slate-600 text-white"
                  />
                ) : (
                  <p className="text-white pixelated-text mt-1">{profileForm.location || 'Not provided'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardHeader>
              <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="text-white pixelated-text font-semibold">Wallet Address</h3>
                  <p className="text-blue-300 pixelated-text text-sm">{getAddressDisplay(address)}</p>
                </div>
                <Button
                  onClick={copyAddress}
                  variant="outline"
                  size="sm"
                  className="bg-slate-700 border-slate-600 text-white pixelated-text"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="text-white pixelated-text font-semibold">Network</h3>
                  <p className="text-blue-300 pixelated-text text-sm">Base Network</p>
                </div>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                  Connected
                </Badge>
              </div>
              
              {user?.account && (
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Account Status</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Base Account Active</p>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 pixelated-text">
                    <Shield className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Statistics & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Overview */}
          <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardHeader>
              <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Activity Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <div className="text-3xl font-bold text-blue-400 pixelated-text mb-1">{totalEntries}</div>
                  <div className="text-sm text-blue-300 pixelated-text">Total Entries</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <div className="text-3xl font-bold text-green-400 pixelated-text mb-1">{currentStreak}</div>
                  <div className="text-sm text-blue-300 pixelated-text">Current Streak</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <div className="text-3xl font-bold text-orange-400 pixelated-text mb-1">{longestStreak}</div>
                  <div className="text-sm text-blue-300 pixelated-text">Longest Streak</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600/30">
                  <div className="text-3xl font-bold text-purple-400 pixelated-text mb-1">{consistency}%</div>
                  <div className="text-sm text-blue-300 pixelated-text">Consistency</div>
                </div>
              </div>
              
              {/* Most Used Tags */}
              {mostUsedTags.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-white pixelated-text font-semibold mb-3">Most Used Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {mostUsedTags.map(({ tag, count }) => (
                      <Badge key={tag} className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                        #{tag} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recent Activity */}
              <div>
                <h4 className="text-white pixelated-text font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  {recentActivity.map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                        <span className="text-blue-300 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white pixelated-text text-sm truncate">
                          {entry.content}
                        </div>
                        <div className="text-xs text-blue-300 pixelated-text">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardHeader>
              <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Push Notifications</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Daily reminders and updates</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, notifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Email Updates</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Weekly activity summaries</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailUpdates}
                  onCheckedChange={(checked) => setPreferences({...preferences, emailUpdates: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Dark Mode</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Use dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-orange-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Auto Save</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Automatically save drafts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => setPreferences({...preferences, autoSave: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Public Profile</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Allow others to view your profile</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.publicProfile}
                  onCheckedChange={(checked) => setPreferences({...preferences, publicProfile: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Show Statistics</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Display activity stats on profile</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.showStats}
                  onCheckedChange={(checked) => setPreferences({...preferences, showStats: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-slate-800/50 border-slate-600 text-white backdrop-blur-sm card-glass">
            <CardHeader>
              <CardTitle className="text-blue-300 pixelated-text flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Export Data</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Download your profile and entries as JSON</p>
                  </div>
                </div>
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="bg-slate-700 border-slate-600 text-white pixelated-text"
                >
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="text-white pixelated-text font-semibold">Clear All Data</h3>
                    <p className="text-blue-300 pixelated-text text-sm">Remove all entries (irreversible)</p>
                  </div>
                </div>
                <Button
                  onClick={clearData}
                  variant="outline"
                  className="bg-red-600/20 border-red-500 text-red-300 pixelated-text hover:bg-red-600/30"
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
