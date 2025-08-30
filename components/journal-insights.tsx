"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Heart, 
  Target, 
  Moon, 
  Sparkles,
  Activity,
  BookOpen,
  BarChart3,
  PieChart,
  Clock,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Award,
  Lightbulb,
  BookMarked
} from "lucide-react"

import { JournalEntry } from "@/types/journal"

interface JournalInsightsProps {
  entries: JournalEntry[]
}

const MOOD_LABELS = {
  1: "Very Sad",
  2: "Sad", 
  3: "Neutral",
  4: "Happy",
  5: "Very Happy"
}

const WEATHER_LABELS = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  rainy: "Rainy",
  snowy: "Snowy",
  windy: "Windy",
  clear: "Clear"
}

const CATEGORY_LABELS = {
  personal: "Personal",
  crypto: "Crypto",
  work: "Work",
  health: "Health",
  learning: "Learning",
  dreams: "Dreams",
  gratitude: "Gratitude"
}

export function JournalInsights({ entries }: JournalInsightsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month')

  const filteredEntries = useMemo(() => {
    const now = new Date()
    const cutoff = new Date()
    
    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoff.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        return entries
    }
    
    return entries.filter(entry => entry.dateCreated && new Date(entry.dateCreated) >= cutoff)
  }, [entries, timeRange])

  const insights = useMemo(() => {
    if (filteredEntries.length === 0) return null

    // Mood analysis
    const moodEntries = filteredEntries.filter(entry => entry.mood)
    const averageMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodEntries.length 
      : 0
    
    const moodDistribution = moodEntries.reduce((acc, entry) => {
      const mood = entry.mood!
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Category analysis
    const categoryCount = filteredEntries.reduce((acc, entry) => {
      if (entry.category) {
        acc[entry.category] = (acc[entry.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Weather analysis
    const weatherCount = filteredEntries.reduce((acc, entry) => {
      if (entry.weather) {
        acc[entry.weather] = (acc[entry.weather] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    // Writing patterns
    const totalWords = filteredEntries.reduce((sum, entry) => 
      sum + entry.journal.split(' ').length, 0)
    const averageWords = totalWords / filteredEntries.length

    // Most active days
    const dayCount = filteredEntries.reduce((acc, entry) => {
      const day = entry.dateCreated ? new Date(entry.dateCreated).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown'
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostActiveDay = Object.entries(dayCount).sort(([,a], [,b]) => b - a)[0]

    // Most used tags
    const tagCount = filteredEntries.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    // Entry types
    const gratitudeCount = filteredEntries.filter(entry => entry.isGratitude).length
    const goalCount = filteredEntries.filter(entry => entry.isGoal).length
    const dreamCount = filteredEntries.filter(entry => entry.isDream).length

    // Writing consistency
    const dates = filteredEntries.map(entry => 
      entry.dateCreated ? new Date(entry.dateCreated).toDateString() : 'Unknown'
    )
    const uniqueDays = new Set(dates).size
    const consistencyRate = (uniqueDays / Math.max(1, filteredEntries.length)) * 100

    return {
      totalEntries: filteredEntries.length,
      averageMood,
      moodDistribution,
      categoryCount,
      weatherCount,
      averageWords,
      mostActiveDay,
      topTags,
      gratitudeCount,
      goalCount,
      dreamCount,
      consistencyRate
    }
  }, [filteredEntries])

  if (!insights) {
    return (
      <Card className="bg-white shadow-sm">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data to analyze</h3>
          <p className="text-gray-500">
            Start writing journal entries to see your insights and patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Journal Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(['week', 'month', 'year', 'all'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-900">{insights.totalEntries}</p>
              </div>
              <BookMarked className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg. Mood</p>
                <p className="text-2xl font-bold text-green-900">
                  {insights.averageMood.toFixed(1)}/5
                </p>
              </div>
              <Heart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg. Words</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(insights.averageWords)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Consistency</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Math.round(insights.consistencyRate)}%
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(insights.moodDistribution).map(([mood, count]) => {
              const percentage = (count / Object.values(insights.moodDistribution).reduce((a, b) => a + b, 0)) * 100
              return (
                <div key={mood} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                                             {MOOD_LABELS[parseInt(mood) as keyof typeof MOOD_LABELS] || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-500">{count} entries</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(insights.categoryCount).map(([category, count]) => {
              const percentage = (count / Object.values(insights.categoryCount).reduce((a, b) => a + b, 0)) * 100
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                    </span>
                    <span className="text-sm text-gray-500">{count} entries</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Weather Patterns */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5" />
              Weather Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(insights.weatherCount).map(([weather, count]) => {
              const percentage = (count / Object.values(insights.weatherCount).reduce((a, b) => a + b, 0)) * 100
              return (
                <div key={weather} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {WEATHER_LABELS[weather as keyof typeof WEATHER_LABELS]}
                    </span>
                    <span className="text-sm text-gray-500">{count} entries</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Writing Patterns */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Writing Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Most Active Day</span>
                <Badge variant="secondary">{insights.mostActiveDay?.[0]}</Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Top Tags</span>
                <div className="flex flex-wrap gap-2">
                  {insights.topTags.map(([tag, count]) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Entry Types</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <Sparkles className="w-4 h-4 mx-auto text-yellow-600 mb-1" />
                    <p className="text-xs font-medium text-yellow-800">{insights.gratitudeCount}</p>
                    <p className="text-xs text-yellow-600">Gratitude</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <Target className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-xs font-medium text-blue-800">{insights.goalCount}</p>
                    <p className="text-xs text-blue-600">Goals</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <Moon className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-xs font-medium text-purple-800">{insights.dreamCount}</p>
                    <p className="text-xs text-purple-600">Dreams</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Personal Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-900">Mood Insights</h4>
              <p className="text-sm text-indigo-700">
                {insights.averageMood >= 4 
                  ? "You've been in a positive mood lately! Keep up the great energy."
                  : insights.averageMood <= 2
                  ? "You've been feeling down. Consider writing more gratitude entries or reaching out to friends."
                  : "Your mood has been neutral. Try mixing up your routine or exploring new activities."
                }
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-indigo-900">Writing Habits</h4>
              <p className="text-sm text-indigo-700">
                {insights.consistencyRate >= 80
                  ? "Excellent consistency! You're building a strong journaling habit."
                  : insights.consistencyRate >= 50
                  ? "Good progress! Try to write a bit more regularly to build momentum."
                  : "You're just getting started. Even a few minutes of writing each day can make a difference."
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-indigo-900">Category Balance</h4>
              <p className="text-sm text-indigo-700">
                {Object.keys(insights.categoryCount).length >= 4
                  ? "Great variety in your entries! You're exploring different aspects of your life."
                  : "Consider writing about different areas of your life to get a more complete picture."
                }
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-indigo-900">Writing Style</h4>
              <p className="text-sm text-indigo-700">
                {insights.averageWords >= 100
                  ? "You're writing detailed entries. This depth will be valuable for reflection."
                  : "You prefer concise entries. Consider occasionally expanding on important moments."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
