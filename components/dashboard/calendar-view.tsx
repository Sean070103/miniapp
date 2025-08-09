"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle } from 'lucide-react'

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface CalendarViewProps {
  entries: DailyEntry[]
  onDateSelect: (date: string) => void
  selectedDate?: string
}

export function CalendarView({ entries, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const getEntryForDate = (date: string) => {
    return entries.find(entry => entry.date === date)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return selectedDate === formatDate(date)
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="bg-slate-700 border-slate-600 text-white pixelated-text"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl font-semibold text-white pixelated-text">{monthName}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="bg-slate-700 border-slate-600 text-white pixelated-text"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center">
            <span className="text-blue-300 text-sm font-semibold pixelated-text">{day}</span>
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((date, index) => {
          const dateString = formatDate(date)
          const entry = getEntryForDate(dateString)
          const hasEntry = !!entry
          
          return (
            <Button
              key={index}
              variant="outline"
              onClick={() => onDateSelect(dateString)}
              className={`h-12 p-1 relative pixelated-text ${
                isToday(date)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400'
                  : isSelected(date)
                  ? 'bg-slate-700 text-white border-slate-500'
                  : isCurrentMonth(date)
                  ? 'bg-slate-700/50 border-slate-600 text-white'
                  : 'border-slate-700 text-slate-500'
              }`}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="text-sm font-medium">{date.getDate()}</span>
                {hasEntry && (
                  <CheckCircle className="w-3 h-3 text-green-400 mt-1" />
                )}
              </div>
            </Button>
          )
        })}
      </div>

      {/* Selected Date Info */}
      {selectedDate && (
        <div className="bg-slate-700/50 rounded-2xl p-4 border border-slate-600">
          <h4 className="text-white font-semibold mb-2 pixelated-text">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          {getEntryForDate(selectedDate) ? (
            <div className="space-y-2">
              <p className="text-blue-300 text-sm font-medium pixelated-text">
                {getEntryForDate(selectedDate)?.content}
              </p>
              {getEntryForDate(selectedDate)?.tags && getEntryForDate(selectedDate)!.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getEntryForDate(selectedDate)!.tags.map((tag, index) => (
                    <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs pixelated-text">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400 text-sm pixelated-text">No entry for this date</p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div className="text-blue-300 font-medium pixelated-text">
          Total Entries: {entries.length}
        </div>
        <div className="text-blue-300 font-medium pixelated-text">
          This Month: {entries.filter(entry => {
            const entryDate = new Date(entry.date)
            return entryDate.getMonth() === currentMonth.getMonth() && 
                   entryDate.getFullYear() === currentMonth.getFullYear()
          }).length}
        </div>
      </div>
    </div>
  )
}
