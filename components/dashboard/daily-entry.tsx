"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Save, Edit3, PenTool, Info, Hash } from 'lucide-react'

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
  
  const articleTypeTags = [
    { type: "DeFi", icon: "💱", color: "from-blue-400 to-blue-600" },
    { type: "NFT", icon: "🖼️", color: "from-blue-500 to-blue-700" },
    { type: "Event", icon: "🎪", color: "from-blue-300 to-blue-500" },
    { type: "Learning", icon: "📚", color: "from-blue-600 to-blue-800" },
    { type: "Governance", icon: "🏛️", color: "from-blue-700 to-blue-900" },
    { type: "Rewards", icon: "🎁", color: "from-blue-200 to-blue-400" },
    { type: "Other", icon: "✨", color: "from-blue-500 to-blue-600" }
  ]
  
  const suggestedTags = ['Base', 'FirstTime', 'Milestone', 'Trading', 'Building', 'Community', 'Web3']

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
      <div className="space-y-4">
        <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
          <p className="text-white text-lg leading-relaxed pixelated-text">{todayEntry.content}</p>
          {todayEntry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {todayEntry.tags.map((tag, index) => (
                <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text">
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          className="bg-slate-700 border-slate-600 text-white pixelated-text"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Entry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your Web3 world today?"
          className="min-h-[120px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 pixelated-text"
        />
        
        {/* Article Type Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-sm pixelated-text">
            <Info className="w-4 h-4" />
            <span>Article Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {articleTypeTags.map((tag) => (
              <Button
                key={tag.type}
                variant={tags.includes(tag.type) ? "default" : "outline"}
                size="sm"
                onClick={() => addTag(tag.type)}
                className={`pixelated-text ${
                  tags.includes(tag.type)
                    ? 'bg-gradient-to-r ' + tag.color + ' text-white border-0'
                    : 'bg-slate-700/50 border-slate-600 text-white'
                }`}
              >
                {tag.icon} {tag.type}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggested Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-300 text-sm pixelated-text">
            <Hash className="w-4 h-4" />
            <span>Suggested Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <Button
                key={tag}
                variant={tags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => addTag(tag)}
                className={`pixelated-text ${
                  tags.includes(tag)
                    ? 'bg-blue-500 text-white border-0'
                    : 'bg-slate-700/50 border-slate-600 text-white'
                }`}
              >
                #{tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <div className="space-y-2">
            <div className="text-blue-300 text-sm pixelated-text">Selected Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30 cursor-pointer pixelated-text"
                  onClick={() => removeTag(tag)}
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {tag}
                  <span className="ml-1 text-blue-200">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!content.trim()}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pixelated-text"
        >
          <Save className="w-4 h-4 mr-2" />
          Post Entry
        </Button>
      </div>
    </div>
  )
}
