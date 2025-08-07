"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Zap, BookOpen, Users, Gift, Calendar, MoreHorizontal, Heart, MessageCircle, Share, Sparkles } from 'lucide-react'

interface Entry {
  id: number
  type: string
  title: string
  description: string
  date: string
  tags: string[]
}

interface EntryListProps {
  entries: Entry[]
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'defi': return <Wallet className="w-5 h-5" />
    case 'nft': return <Zap className="w-5 h-5" />
    case 'learning': return <BookOpen className="w-5 h-5" />
    case 'event': return <Users className="w-5 h-5" />
    case 'reward': return <Gift className="w-5 h-5" />
    case 'dao': return <Calendar className="w-5 h-5" />
    default: return <Sparkles className="w-5 h-5" />
  }
}

const getTypeGradient = (type: string) => {
  switch (type) {
    case 'defi': return 'from-blue-400 to-blue-600'
    case 'nft': return 'from-blue-500 to-blue-700'
    case 'learning': return 'from-blue-300 to-blue-500'
    case 'event': return 'from-blue-600 to-blue-800'
    case 'reward': return 'from-blue-200 to-blue-400'
    case 'dao': return 'from-blue-700 to-blue-900'
    default: return 'from-blue-500 to-blue-600'
  }
}

export function EntryList({ entries }: EntryListProps) {
  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <Card key={entry.id} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-sm overflow-hidden border border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${getTypeGradient(entry.type)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                {getTypeIcon(entry.type)}
              </div>
              
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-blue-900 text-lg leading-tight group-hover:text-blue-700 transition-colors duration-300">
                      {entry.title}
                    </h3>
                    <p className="text-blue-700 leading-relaxed">{entry.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-colors duration-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"></div>
                    <span className="text-sm text-blue-600 font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[
                      { icon: Heart, color: "hover:text-red-500" },
                      { icon: MessageCircle, color: "hover:text-blue-600" },
                      { icon: Share, color: "hover:text-blue-500" },
                      { icon: MoreHorizontal, color: "hover:text-blue-800" }
                    ].map((action, index) => (
                      <Button 
                        key={index}
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 w-9 p-0 hover:bg-blue-50 ${action.color} transition-all duration-300 hover:scale-110 rounded-xl`}
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
