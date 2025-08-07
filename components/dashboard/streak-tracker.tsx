"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Trophy, Target, TrendingUp, Calendar } from 'lucide-react'

interface DailyEntry {
  id: string
  date: string
  content: string
  tags: string[]
  timestamp: number
}

interface StreakTrackerProps {
  entries: DailyEntry[]
}

export function StreakTracker({ entries }: StreakTrackerProps) {
  const calculateStreak = () => {
    if (entries.length === 0) return { current: 0, longest: 0, consecutive: 0 }
    
    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    // Calculate current streak
    let currentDate = new Date()
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0]
      const hasEntry = sortedEntries.some(entry => entry.date === dateString)
      
      if (hasEntry) {
        currentStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    // Calculate longest streak
    const dates = sortedEntries.map(entry => entry.date).sort()
    let prevDate = null
    
    for (const date of dates) {
      if (prevDate) {
        const daysDiff = Math.floor((new Date(date).getTime() - new Date(prevDate).getTime()) / (24 * 60 * 60 * 1000))
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak + 1)
          tempStreak = 0
        }
      } else {
        tempStreak = 1
      }
      prevDate = date
    }
    longestStreak = Math.max(longestStreak, tempStreak)
    
    return { current: currentStreak, longest: longestStreak, consecutive: currentStreak }
  }

  const calculateWeeklyProgress = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDays.push(date.toISOString().split('T')[0])
    }
    
    const weekEntries = entries.filter(entry => weekDays.includes(entry.date))
    return (weekEntries.length / 7) * 100
  }

  const calculateMonthlyProgress = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    
    const monthDays = []
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i)
      monthDays.push(date.toISOString().split('T')[0])
    }
    
    const monthEntries = entries.filter(entry => monthDays.includes(entry.date))
    return (monthEntries.length / daysInMonth) * 100
  }

  const { current, longest, consecutive } = calculateStreak()
  const weeklyProgress = calculateWeeklyProgress()
  const monthlyProgress = calculateMonthlyProgress()

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥'
    if (streak >= 21) return '🔥🔥'
    if (streak >= 7) return '🔥'
    if (streak >= 3) return '⚡'
    return '💪'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!"
    if (streak === 1) return "Great start! Keep it going!"
    if (streak < 7) return "Building momentum!"
    if (streak < 21) return "You're on fire!"
    if (streak < 30) return "Incredible consistency!"
    return "Legendary streak! You're unstoppable!"
  }

  return (
         <Card className="border-0 shadow-xl bg-white">
       <CardHeader className="pb-4">
         <CardTitle className="text-black flex items-center gap-3">
           <Flame className="w-6 h-6 text-orange-500" />
           Streak Tracker
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-6">
         {/* Current Streak */}
         <div className="text-center space-y-3">
           <div className="flex items-center justify-center gap-2">
             <span className="text-4xl">{getStreakEmoji(current)}</span>
             <div>
               <h3 className="text-3xl font-bold text-black">{current}</h3>
               <p className="text-black text-sm font-medium">day streak</p>
             </div>
           </div>
           <p className="text-black text-sm font-medium">{getStreakMessage(current)}</p>
         </div>

                 {/* Stats Grid */}
         <div className="grid grid-cols-2 gap-4">
           <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center">
             <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
             <h4 className="text-black font-semibold text-lg">{longest}</h4>
             <p className="text-black text-sm font-medium">Longest Streak</p>
           </div>
           <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-center">
             <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
             <h4 className="text-black font-semibold text-lg">{entries.length}</h4>
             <p className="text-black text-sm font-medium">Total Entries</p>
           </div>
         </div>

                 {/* Progress Bars */}
         <div className="space-y-4">
           <div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-black text-sm font-semibold">This Week</span>
               <span className="text-black text-sm font-medium">{Math.round(weeklyProgress)}%</span>
             </div>
             <Progress value={weeklyProgress} className="h-2" />
           </div>
           
           <div>
             <div className="flex items-center justify-between mb-2">
               <span className="text-black text-sm font-semibold">This Month</span>
               <span className="text-black text-sm font-medium">{Math.round(monthlyProgress)}%</span>
             </div>
             <Progress value={monthlyProgress} className="h-2" />
           </div>
         </div>

                 {/* Recent Activity */}
         <div className="space-y-3">
           <h4 className="text-black font-semibold flex items-center gap-2">
             <TrendingUp className="w-4 h-4" />
             Recent Activity
           </h4>
           <div className="space-y-2">
             {entries.slice(0, 5).map((entry, index) => (
               <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                 <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                   <Calendar className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-black text-sm font-semibold truncate">
                     {new Date(entry.date).toLocaleDateString('en-US', { 
                       month: 'short', 
                       day: 'numeric' 
                     })}
                   </p>
                   <p className="text-black text-xs truncate font-medium">{entry.content}</p>
                 </div>
                                   {entry.tags.length > 0 && (
                    <Badge className="bg-black text-white border-black text-xs">
                      {entry.tags[0]}
                    </Badge>
                  )}
               </div>
             ))}
           </div>
         </div>

                 {/* Motivation */}
         {current > 0 && (
           <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-4 border border-gray-200">
             <p className="text-black text-sm text-center font-medium">
               {current === 1 
                 ? "You've started your journey! Come back tomorrow to keep the streak alive."
                 : `Amazing! You've been consistent for ${current} day${current > 1 ? 's' : ''}. Keep it up!`
               }
             </p>
           </div>
         )}
      </CardContent>
    </Card>
  )
}
