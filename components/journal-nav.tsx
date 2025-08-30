"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, BarChart3, Calendar, Plus } from "lucide-react"
import Link from "next/link"

export function JournalNav() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link href="/journal">
        <Button variant="outline" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Journal
        </Button>
      </Link>
      
      <Link href="/journal?tab=write">
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </Link>
      
      <Link href="/journal?tab=timeline">
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Timeline
        </Button>
      </Link>
      
      <Link href="/journal?tab=insights">
        <Button variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Insights
        </Button>
      </Link>
    </div>
  )
}
