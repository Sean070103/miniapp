"use client"

import { useState, useEffect } from "react"
import { JournalEntryForm } from "@/components/journal-entry-form"
import { JournalTimeline } from "@/components/journal-timeline"
import { JournalInsights } from "@/components/journal-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2,
  Heart,
  Target,
  Moon,
  Sparkles
} from "lucide-react"

import { JournalEntry } from "@/types/journal"

export default function JournalPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("write")
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)

  // Fetch user's journal entries
  const fetchEntries = async () => {
    if (!user?.address) return

    try {
      const response = await fetch("/api/journal/getby/id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUserId: user.address }),
      })

      if (response.ok) {
        const data = await response.json()
        setEntries(data.map((entry: any) => ({
          ...entry,
          dateCreated: new Date(entry.dateCreated)
        })))
      }
    } catch (error) {
      console.error("Error fetching entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [user?.address])

  const handleSaveEntry = (entry: Omit<JournalEntry, 'id' | 'dateCreated'>) => {
    if (editingEntry) {
      // Update existing entry
      fetch(`/api/journal/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, id: editingEntry.id }),
      })
      .then(response => {
        if (response.ok) {
          setEntries(prev => prev.map(e => e.id === editingEntry.id ? { ...entry, id: editingEntry.id, dateCreated: e.dateCreated } : e))
          setEditingEntry(null)
        }
      })
      .catch(error => {
        console.error("Error updating entry:", error)
      })
    } else {
      // Add new entry - this will be handled by the API response
      // The API will return the complete entry with id and dateCreated
    }
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry)
    setActiveTab("write")
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      const response = await fetch(`/api/journal/delete?journalId=${entryId}&userId=${user?.address}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setEntries(prev => prev.filter(e => e.id !== entryId))
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const handleTogglePrivacy = async (entryId: string) => {
    const entry = entries.find(e => e.id === entryId)
    if (!entry) return

    const newPrivacy = entry.privacy === "public" ? "private" : "public"
    
    try {
      const response = await fetch(`/api/journal/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, privacy: newPrivacy }),
      })

      if (response.ok) {
        setEntries(prev => prev.map(e => 
          e.id === entryId ? { ...e, privacy: newPrivacy } : e
        ))
      }
    } catch (error) {
      console.error("Error updating privacy:", error)
    }
  }

  if (!user?.isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start journaling and tracking your thoughts.
            </p>
            <Button className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Personal Journal</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your thoughts, feelings, and experiences. Build a meaningful record of your journey.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{entries.length}</p>
            <p className="text-sm text-blue-600">Total Entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">
              {entries.filter(e => e.isGratitude).length}
            </p>
            <p className="text-sm text-green-600">Gratitude Entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">
              {entries.filter(e => e.isGoal).length}
            </p>
            <p className="text-sm text-purple-600">Goal Entries</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4 text-center">
            <Moon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-900">
              {entries.filter(e => e.isDream).length}
            </p>
            <p className="text-sm text-indigo-600">Dream Entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Write
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingEntry ? (
                  <>
                    <Edit3 className="w-5 h-5" />
                    Edit Journal Entry
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    New Journal Entry
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JournalEntryForm
                userId={user.address}
                onSave={handleSaveEntry}
                initialEntry={editingEntry || undefined}
                isEditing={!!editingEntry}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your entries...</p>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your journaling journey by writing your first entry.
                </p>
                <Button onClick={() => setActiveTab("write")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write Your First Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <JournalTimeline
              entries={entries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onTogglePrivacy={handleTogglePrivacy}
            />
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading insights...</p>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No data to analyze</h3>
                <p className="text-gray-600 mb-6">
                  Write some entries to see your personal insights and patterns.
                </p>
                <Button onClick={() => setActiveTab("write")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <JournalInsights entries={entries} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
