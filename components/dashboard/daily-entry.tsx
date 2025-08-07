"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Save, Edit3, PenTool } from 'lucide-react'

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface DailyEntryProps {
  onSave: (entry: DailyEntry) => void
  todayEntry?: DailyEntry
}

export function DailyEntry({ onSave, todayEntry }: DailyEntryProps) {
  const [content, setContent] = useState(todayEntry?.content || '')
  const [isEditing, setIsEditing] = useState(!todayEntry)
  const [tags, setTags] = useState<string[]>(todayEntry?.tags || [])

  const today = new Date().toISOString().split('T')[0]
  const suggestedTags = ['DeFi', 'NFT', 'Learning', 'Trading', 'Building', 'Community', 'Rewards']

  const handleSave = () => {
    if (!content.trim()) return

    const entry: DailyEntry = {
      id: todayEntry?.id || `entry-${Date.now()}`,
      date: today,
      content: content.trim(),
      tags,
      timestamp: Date.now()
    }

    onSave(entry)
    setIsEditing(false)
  }

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (!isEditing && todayEntry) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-gray-800 flex items-center gap-3">
            <PenTool className="w-6 h-6 text-blue-600" />
            Today's Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-800 text-lg leading-relaxed">{todayEntry.content}</p>
            {todayEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {todayEntry.tags.map((tag, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Entry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-800 flex items-center gap-3">
          <PenTool className="w-6 h-6 text-blue-600" />
          Write Today's Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you learn or experience in crypto today? Share your thoughts, trades, or discoveries..."
          className="min-h-[150px] bg-gray-50 border-gray-300 text-gray-800 placeholder:text-gray-500 resize-none rounded-xl"
        />
        
        <div className="space-y-3">
          <p className="text-gray-700 text-sm font-semibold">Add tags to categorize your entry:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => addTag(tag)}
                disabled={tags.includes(tag)}
                className={`${
                  tags.includes(tag)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  className="bg-blue-100 text-blue-800 border-blue-200 cursor-pointer hover:bg-blue-200"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={!content.trim()}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Journal Entry
        </Button>
      </CardContent>
    </Card>
  )
}
