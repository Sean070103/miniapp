"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Calendar, 
  MapPin, 
  Heart, 
  Target, 
  Moon, 
  Sparkles,
  TrendingUp,
  Activity,
  BookOpen,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

import { JournalEntry } from "@/types/journal"

interface JournalTimelineProps {
  entries: JournalEntry[]
  onEdit?: (entry: JournalEntry) => void
  onDelete?: (entryId: string) => void
  onTogglePrivacy?: (entryId: string) => void
}

const MOOD_EMOJIS = {
  1: "😢",
  2: "😕", 
  3: "😐",
  4: "🙂",
  5: "😄"
}

const WEATHER_EMOJIS = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  snowy: "❄️",
  windy: "💨",
  clear: "🌙"
}

const CATEGORY_ICONS = {
  personal: Heart,
  crypto: TrendingUp,
  work: Activity,
  health: Target,
  learning: BookOpen,
  dreams: Moon,
  gratitude: Sparkles
}

const CATEGORY_COLORS = {
  personal: "from-pink-500 to-rose-500",
  crypto: "from-green-500 to-emerald-500", 
  work: "from-blue-500 to-indigo-500",
  health: "from-purple-500 to-violet-500",
  learning: "from-orange-500 to-amber-500",
  dreams: "from-indigo-500 to-purple-500",
  gratitude: "from-yellow-500 to-orange-500"
}

export function JournalTimeline({ entries, onEdit, onDelete, onTogglePrivacy }: JournalTimelineProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMood, setFilterMood] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showPrivate, setShowPrivate] = useState(true)

  const filteredEntries = entries.filter(entry => {
    // Category filter
    if (filterCategory !== "all" && entry.category !== filterCategory) return false
    
    // Mood filter
    if (filterMood !== "all" && entry.mood?.toString() !== filterMood) return false
    
    // Privacy filter
    if (!showPrivate && entry.privacy === "private") return false
    
    // Search filter
    if (searchQuery && !entry.journal.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    
    return true
  })

  const formatDate = (date: Date) => {
    const now = new Date()
    const entryDate = new Date(date)
    const diffTime = Math.abs(now.getTime() - entryDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "Yesterday"
    if (diffDays === 0) return "Today"
    if (diffDays < 7) return `${diffDays} days ago`
    
    return entryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: entryDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getEntryIcon = (entry: JournalEntry) => {
    if (entry.isGratitude) return Sparkles
    if (entry.isGoal) return Target
    if (entry.isDream) return Moon
    if (entry.category && CATEGORY_ICONS[entry.category as keyof typeof CATEGORY_ICONS]) {
      return CATEGORY_ICONS[entry.category as keyof typeof CATEGORY_ICONS]
    }
    return Calendar
  }

  const getEntryColor = (entry: JournalEntry) => {
    if (entry.category && CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]) {
      return CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]
    }
    return "from-gray-500 to-gray-600"
  }

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = entry.dateCreated ? new Date(entry.dateCreated).toDateString() : 'Unknown'
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(entry)
    return groups
  }, {} as Record<string, JournalEntry[]>)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Timeline Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="dreams">Dreams</SelectItem>
                <SelectItem value="gratitude">Gratitude</SelectItem>
              </SelectContent>
            </Select>

            {/* Mood Filter */}
            <Select value={filterMood} onValueChange={setFilterMood}>
              <SelectTrigger>
                <SelectValue placeholder="All Moods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                <SelectItem value="1">😢 Very Sad</SelectItem>
                <SelectItem value="2">😕 Sad</SelectItem>
                <SelectItem value="3">😐 Neutral</SelectItem>
                <SelectItem value="4">🙂 Happy</SelectItem>
                <SelectItem value="5">😄 Very Happy</SelectItem>
              </SelectContent>
            </Select>

            {/* Privacy Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowPrivate(!showPrivate)}
              className="flex items-center gap-2"
            >
              {showPrivate ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showPrivate ? "Show All" : "Hide Private"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedEntries).map(([date, dayEntries]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatDate(new Date(date))}
                </h3>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <Badge variant="secondary" className="text-sm">
                {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
              </Badge>
            </div>

            {/* Entries for this date */}
            <div className="space-y-4">
              {dayEntries.map((entry) => {
                const EntryIcon = getEntryIcon(entry)
                const entryColor = getEntryColor(entry)
                
                return (
                  <Card key={entry.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Entry Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${entryColor} flex items-center justify-center text-white`}>
                            <EntryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {entry.category ? entry.category.charAt(0).toUpperCase() + entry.category.slice(1) : 'Journal'} Entry
                              </span>
                              {entry.privacy === "private" && (
                                <Badge variant="outline" className="text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                              {entry.isGratitude && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Gratitude
                                </Badge>
                              )}
                              {entry.isGoal && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                  <Target className="w-3 h-3 mr-1" />
                                  Goal
                                </Badge>
                              )}
                              {entry.isDream && (
                                <Badge className="bg-purple-100 text-purple-800 text-xs">
                                  <Moon className="w-3 h-3 mr-1" />
                                  Dream
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                             <span>{entry.dateCreated ? new Date(entry.dateCreated).toLocaleTimeString('en-US', { 
                                 hour: 'numeric', 
                                 minute: '2-digit',
                                 hour12: true 
                               }) : 'Unknown'}</span>
                              {entry.location && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {entry.location}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(entry)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(entry.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Mood and Weather */}
                      <div className="flex items-center gap-4 mb-4">
                        {entry.mood && (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}</span>
                            <span className="text-sm text-gray-600">Mood: {entry.mood}/5</span>
                          </div>
                        )}
                        {entry.weather && (
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{WEATHER_EMOJIS[entry.weather as keyof typeof WEATHER_EMOJIS]}</span>
                            <span className="text-sm text-gray-600 capitalize">{entry.weather}</span>
                          </div>
                        )}
                      </div>

                      {/* Entry Content */}
                      <div className="mb-4">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {entry.journal}
                        </p>
                      </div>

                      {/* Photos */}
                      {entry.photos && entry.photos.length > 0 && (
                        <div className="mb-4">
                          <div className={`grid gap-2 ${
                            entry.photos.length === 1 ? 'grid-cols-1' :
                            entry.photos.length === 2 ? 'grid-cols-2' :
                            'grid-cols-3'
                          }`}>
                            {entry.photos.slice(0, 6).map((photo, index) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                <img
                                  src={photo}
                                  alt={`Entry photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {entry.photos.length > 6 && (
                              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">+{entry.photos.length - 6} more</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Prompt used */}
                      {entry.prompt && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-700">
                            <span className="font-medium">Prompt:</span> {entry.prompt}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <Card className="bg-white shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
