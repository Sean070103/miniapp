"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  User,
  Settings,
  Save,
  RotateCcw
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface NotificationPreferences {
  likes: boolean
  comments: boolean
  reposts: boolean
  follows: boolean
  mentions: boolean
  emailDigest: boolean
  pushNotifications: boolean
  quietHours: boolean
  quietHoursStart: string
  quietHoursEnd: string
}

interface NotificationPreferencesProps {
  userId: string
  onSave?: (preferences: NotificationPreferences) => void
}

const defaultPreferences: NotificationPreferences = {
  likes: true,
  comments: true,
  reposts: true,
  follows: true,
  mentions: true,
  emailDigest: false,
  pushNotifications: true,
  quietHours: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00'
}

export function NotificationPreferences({ 
  userId, 
  onSave 
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { toast } = useToast()

  // Load preferences on mount
  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPreferences(data.preferences)
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error)
    }
  }

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          preferences
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast({
            title: "Preferences Saved",
            description: "Your notification preferences have been updated."
          })
          setHasChanges(false)
          onSave?.(preferences)
        }
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setPreferences(defaultPreferences)
    setHasChanges(true)
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const notificationTypes = [
    {
      key: 'likes' as const,
      label: 'Likes',
      description: 'When someone likes your posts',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      key: 'comments' as const,
      label: 'Comments',
      description: 'When someone comments on your posts',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      key: 'reposts' as const,
      label: 'Reposts',
      description: 'When someone reposts your content',
      icon: Share2,
      color: 'text-green-500'
    },
    {
      key: 'follows' as const,
      label: 'New Followers',
      description: 'When someone starts following you',
      icon: UserPlus,
      color: 'text-purple-500'
    },
    {
      key: 'mentions' as const,
      label: 'Mentions',
      description: 'When someone mentions you in a post',
      icon: User,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
          <p className="text-gray-600">Customize how and when you receive notifications</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={savePreferences}
            disabled={isLoading || !hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map((type) => {
            const Icon = type.icon
            return (
              <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${type.color}`} />
                  <div>
                    <Label className="text-sm font-medium">{type.label}</Label>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key]}
                  onCheckedChange={(checked) => updatePreference(type.key, checked)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-xs text-gray-500">Receive notifications in your browser</p>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Email Digest</Label>
              <p className="text-xs text-gray-500">Daily summary of your notifications</p>
            </div>
            <Switch
              checked={preferences.emailDigest}
              onCheckedChange={(checked) => updatePreference('emailDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-sm font-medium">Enable Quiet Hours</Label>
              <p className="text-xs text-gray-500">Pause notifications during specific hours</p>
            </div>
            <Switch
              checked={preferences.quietHours}
              onCheckedChange={(checked) => updatePreference('quietHours', checked)}
            />
          </div>
          
          {preferences.quietHours && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Start Time</Label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">End Time</Label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

