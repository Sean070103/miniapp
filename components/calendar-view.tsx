"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Flame, CalendarIcon, TrendingUp, Target } from 'lucide-react'

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Mock data for entries
  const entryDates = [
    "2024-01-01", "2024-01-02", "2024-01-03", "2024-01-05", 
    "2024-01-06", "2024-01-07", "2024-01-08", "2024-01-10",
    "2024-01-12", "2024-01-13", "2024-01-15", "2024-01-16"
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const hasEntry = (year: number, month: number, day: number) => {
    const dateKey = formatDateKey(year, month, day)
    return entryDates.includes(dateKey)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Calculate current streak
  const today = new Date()
  let currentStreak = 0
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateKey = formatDateKey(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
    if (entryDates.includes(dateKey)) {
      currentStreak++
    } else if (i > 0) {
      break
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with streak info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
            Your Base Journey Calendar
          </h2>
          <p className="text-blue-100 text-lg font-medium">Track your daily Base activities and build streaks</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-3xl font-bold text-blue-700">{currentStreak}</span>
            <span className="text-blue-600 ml-2 font-medium">day streak</span>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl border border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900">{monthYear}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('prev')}
                className="hover:bg-blue-50 hover:border-blue-400 transition-colors duration-300 border-blue-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth('next')}
                className="hover:bg-blue-50 hover:border-blue-400 transition-colors duration-300 border-blue-200"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-bold text-blue-600 uppercase tracking-wide">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-2 h-14"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const hasEntryToday = hasEntry(currentDate.getFullYear(), currentDate.getMonth(), day)
              const isToday = 
                currentDate.getFullYear() === today.getFullYear() &&
                currentDate.getMonth() === today.getMonth() &&
                day === today.getDate()

              return (
                <div
                  key={day}
                  className={`
                    p-2 h-14 flex items-center justify-center text-sm rounded-xl cursor-pointer
                    transition-all duration-300 relative font-medium hover:scale-105
                    ${isToday ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg ring-4 ring-blue-200' : ''}
                    ${hasEntryToday && !isToday ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 border-2 border-blue-400 shadow-md' : ''}
                    ${!hasEntryToday && !isToday ? 'hover:bg-blue-50 text-blue-600' : ''}
                  `}
                >
                  {day}
                  {hasEntryToday && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-sm"></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border-2 border-blue-400"></div>
              <span className="text-sm text-blue-700 font-medium">Has Entry</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-sm"></div>
              <span className="text-sm text-blue-700 font-medium">Today</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-50 rounded-lg border border-blue-300"></div>
              <span className="text-sm text-blue-700 font-medium">No Entry</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: TrendingUp,
            value: 12,
            label: "Entries This Month",
            gradient: "from-blue-400 to-blue-600",
            bgGradient: "from-blue-50 to-blue-100"
          },
          {
            icon: CalendarIcon,
            value: 8,
            label: "Active Days",
            gradient: "from-blue-500 to-blue-700",
            bgGradient: "from-blue-100 to-blue-200"
          },
          {
            icon: Target,
            value: "67%",
            label: "Consistency Rate",
            gradient: "from-blue-300 to-blue-500",
            bgGradient: "from-blue-50 to-blue-150"
          }
        ].map((stat, index) => (
          <Card key={index} className={`border-0 shadow-xl bg-gradient-to-br ${stat.bgGradient} hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-blue-200`}>
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-900">{stat.value}</div>
                <div className="text-sm text-blue-700 font-medium">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
