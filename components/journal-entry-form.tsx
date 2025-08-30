"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Save, 
  Edit3, 
  Info, 
  Hash, 
  Camera, 
  X, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon, 
  Check,
  Heart,
  Target,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  MapPin,
  Sparkles,
  BookOpen,
  TrendingUp,
  Activity
} from "lucide-react"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

import { JournalEntry } from "@/types/journal"

interface JournalEntryFormProps {
  userId: string
  onSave?: (entry: Omit<JournalEntry, 'id' | 'dateCreated'>) => void
  initialEntry?: Partial<JournalEntry>
  isEditing?: boolean
}

const MOOD_OPTIONS = [
  { value: 1, label: "😢 Very Sad", color: "text-red-500" },
  { value: 2, label: "😕 Sad", color: "text-orange-500" },
  { value: 3, label: "😐 Neutral", color: "text-yellow-500" },
  { value: 4, label: "🙂 Happy", color: "text-green-500" },
  { value: 5, label: "😄 Very Happy", color: "text-blue-500" },
]

const WEATHER_OPTIONS = [
  { value: "sunny", label: "☀️ Sunny", icon: Sun },
  { value: "cloudy", label: "☁️ Cloudy", icon: Cloud },
  { value: "rainy", label: "🌧️ Rainy", icon: CloudRain },
  { value: "snowy", label: "❄️ Snowy", icon: CloudSnow },
  { value: "windy", label: "💨 Windy", icon: Wind },
  { value: "clear", label: "🌙 Clear", icon: Moon },
]

const CATEGORY_OPTIONS = [
  { value: "personal", label: "Personal", icon: Heart, color: "from-pink-500 to-rose-500" },
  { value: "crypto", label: "Crypto", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
  { value: "work", label: "Work", icon: Activity, color: "from-blue-500 to-indigo-500" },
  { value: "health", label: "Health", icon: Target, color: "from-purple-500 to-violet-500" },
  { value: "learning", label: "Learning", icon: BookOpen, color: "from-orange-500 to-amber-500" },
  { value: "dreams", label: "Dreams", icon: Moon, color: "from-indigo-500 to-purple-500" },
  { value: "gratitude", label: "Gratitude", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
]

const JOURNAL_PROMPTS = [
  "What made you smile today?",
  "What's one thing you're grateful for?",
  "What did you learn today?",
  "What's your biggest challenge right now?",
  "What are you looking forward to?",
  "What's one thing you'd like to improve?",
  "What's your biggest win today?",
  "What's on your mind?",
  "How are you feeling?",
  "What's your goal for tomorrow?",
]

export function JournalEntryForm({ userId, onSave, initialEntry, isEditing = false }: JournalEntryFormProps) {
  const [content, setContent] = useState(initialEntry?.journal || "")
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || [])
  const [photos, setPhotos] = useState<string[]>(initialEntry?.photos || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())
  
  // New journal-specific states
  const [mood, setMood] = useState<number | undefined>(initialEntry?.mood)
  const [weather, setWeather] = useState<string | undefined>(initialEntry?.weather)
  const [location, setLocation] = useState<string | undefined>(initialEntry?.location)
  const [category, setCategory] = useState<string | undefined>(initialEntry?.category)
  const [isGratitude, setIsGratitude] = useState(initialEntry?.isGratitude || false)
  const [isGoal, setIsGoal] = useState(initialEntry?.isGoal || false)
  const [isDream, setIsDream] = useState(initialEntry?.isDream || false)
  const [selectedPrompt, setSelectedPrompt] = useState<string | undefined>(initialEntry?.prompt)
  const [showPrompts, setShowPrompts] = useState(false)

  const { user } = useAuth()

  const suggestedTags = [
    "Base", "FirstTime", "Milestone", "Trading", "Building", "Community", "Web3",
    "Reflection", "Growth", "Challenge", "Success", "Learning", "Family", "Friends"
  ]

  const handlePostClick = () => {
    if (!content.trim()) return
    setShowConfirmDialog(true)
  }

  const handleConfirmPost = async () => {
    setShowConfirmDialog(false)
    await handleSave()
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    if (!user) {
      throw new Error("User not logged in")
    }

    const journalData = {
      baseUserId: user.address,
      journal: content.trim(),
      tags,
      photos,
      likes: 0,
      privacy: "public",
      mood,
      weather,
      location,
      category,
      isGratitude,
      isGoal,
      isDream,
      prompt: selectedPrompt,
    }

    try {
      const response = await fetch("/api/journal/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      })

      if (!response.ok) {
        throw new Error((await response.text()) || "Failed to save journal")
      }

      const data = await response.json()

      if (onSave) {
        onSave(data)
      }

      setSuccess(true)
      
      // Show success animation
      setTimeout(() => {
        setSuccess(false)
        // Reset form for new entry
        setContent("")
        setTags([])
        setPhotos([])
        setMood(undefined)
        setWeather(undefined)
        setLocation(undefined)
        setCategory(undefined)
        setIsGratitude(false)
        setIsGoal(false)
        setIsDream(false)
        setSelectedPrompt(undefined)
        setError(null)
        setImageLoadErrors(new Set())
      }, 3000)

    } catch (err) {
      console.error("Error saving journal:", err)
      setError(err instanceof Error ? err.message : "Failed to save journal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt)
    setContent(prompt)
    setShowPrompts(false)
  }

  const getMoodEmoji = (moodValue: number) => {
    const mood = MOOD_OPTIONS.find(m => m.value === moodValue)
    return mood ? mood.label.split(" ")[0] : "😐"
  }

  const getWeatherEmoji = (weatherValue: string) => {
    const weather = WEATHER_OPTIONS.find(w => w.value === weatherValue)
    return weather ? weather.label.split(" ")[0] : "☀️"
  }

  return (
    <div className="space-y-6">
      {/* Journal Prompts */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Journal Prompts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {JOURNAL_PROMPTS.slice(0, 6).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePromptSelect(prompt)}
                className="text-left justify-start h-auto p-3 text-sm"
              >
                {prompt}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrompts(!showPrompts)}
            className="mt-2 text-purple-600"
          >
            {showPrompts ? "Show Less" : "Show More Prompts"}
          </Button>
          {showPrompts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {JOURNAL_PROMPTS.slice(6).map((prompt, index) => (
                <Button
                  key={index + 6}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptSelect(prompt)}
                  className="text-left justify-start h-auto p-3 text-sm"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Entry Form */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mood Tracking */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">How are you feeling today?</Label>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map((moodOption) => (
                <Button
                  key={moodOption.value}
                  variant={mood === moodOption.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(mood === moodOption.value ? undefined : moodOption.value)}
                  className={`${moodOption.color} ${mood === moodOption.value ? 'bg-opacity-20' : ''}`}
                >
                  {moodOption.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Weather & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Weather</Label>
              <Select value={weather} onValueChange={setWeather}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_OPTIONS.map((weatherOption) => {
                    const Icon = weatherOption.icon
                    return (
                      <SelectItem key={weatherOption.value} value={weatherOption.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {weatherOption.label.split(" ")[1]}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Location (optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Where are you?"
                  value={location || ""}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((catOption) => {
                const Icon = catOption.icon
                return (
                  <Button
                    key={catOption.value}
                    variant={category === catOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategory(category === catOption.value ? undefined : catOption.value)}
                    className={`${category === catOption.value ? `bg-gradient-to-r ${catOption.color} text-white` : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {catOption.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Special Entry Types */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Entry Type</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="gratitude"
                  checked={isGratitude}
                  onCheckedChange={setIsGratitude}
                />
                <Label htmlFor="gratitude" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Gratitude Entry
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="goal"
                  checked={isGoal}
                  onCheckedChange={setIsGoal}
                />
                <Label htmlFor="goal" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Goal Entry
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dream"
                  checked={isDream}
                  onCheckedChange={setIsDream}
                />
                <Label htmlFor="dream" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dream Entry
                </Label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Entry</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts, feelings, or experiences..."
              className="min-h-[200px] resize-none"
              maxLength={2000}
            />
            <div className="text-sm text-gray-500 text-right">
              {content.length}/2000
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className="text-xs"
                >
                  #{tag}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} className="bg-blue-100 text-blue-800">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="ml-1 p-0 h-auto text-blue-800 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Photos (optional)</Label>
            <UploadButton<OurFileRouter, "imageUploader">
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setIsUploading(false)
                const urls = res?.map((r) => r.url) || []
                setPhotos([...photos, ...urls])
              }}
              onUploadError={(error: Error) => {
                setIsUploading(false)
                setError(`Upload failed: ${error.message}`)
              }}
              onUploadBegin={() => setIsUploading(true)}
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handlePostClick}
              disabled={!content.trim() || isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Entry
                </>
              )}
            </Button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-sm">Entry saved successfully!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Journal Entry?</DialogTitle>
            <DialogDescription>
              Are you sure you want to save this entry? You can edit it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPost}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
