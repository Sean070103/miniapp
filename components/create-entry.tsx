"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Camera, Hash, X, Plus, Sparkles, Save, FileText } from 'lucide-react'

export function CreateEntry() {
  const [entryType, setEntryType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])

  const entryTypes = [
    { value: "defi", label: "Base DeFi", icon: "💱", gradient: "from-blue-400 to-blue-600" },
    { value: "nft", label: "Base NFT", icon: "🖼️", gradient: "from-blue-500 to-blue-700" },
    { value: "event", label: "Base Event", icon: "🎪", gradient: "from-blue-300 to-blue-500" },
    { value: "learning", label: "Base Learning", icon: "📚", gradient: "from-blue-600 to-blue-800" },
    { value: "dao", label: "Base Governance", icon: "🏛️", gradient: "from-blue-700 to-blue-900" },
    { value: "reward", label: "Base Rewards", icon: "🎁", gradient: "from-blue-200 to-blue-400" },
    { value: "other", label: "Other Base Activity", icon: "✨", gradient: "from-blue-500 to-blue-600" }
  ]

  const popularTags = [
    "#FirstTime", "#Base", "#DeFi", "#NFT", "#Learning", 
    "#Milestone", "#Event", "#Rewards", "#Governance", "#Web3"
  ]

  const addTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag])
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addPhoto = () => {
    // Simulate adding a photo
    const newPhoto = `/placeholder.svg?height=200&width=300&text=Photo${photos.length + 1}`
    setPhotos([...photos, newPhoto])
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would save the entry
    console.log({
      entryType,
      title,
      description,
      tags,
      isPublic,
      photos,
      date: new Date().toISOString()
    })
    
    // Reset form
    setEntryType("")
    setTitle("")
    setDescription("")
    setTags([])
    setPhotos([])
    setIsPublic(false)
    
    alert("Entry saved successfully!")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Create New Entry
          </h2>
        </div>
        <p className="text-blue-600 text-lg">Document your Base journey</p>
      </div>

      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl border border-blue-100">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl text-blue-900">New Base Journal Entry</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Entry Type */}
            <div className="space-y-3">
              <Label htmlFor="entry-type" className="text-base font-semibold text-blue-800">Activity Type</Label>
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger className="h-12 border-2 border-blue-200 hover:border-blue-400 transition-colors duration-300 rounded-xl">
                  <SelectValue placeholder="What did you do on Base?" />
                </SelectTrigger>
                <SelectContent>
                  {entryTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${type.gradient} rounded-lg flex items-center justify-center text-sm shadow-sm`}>
                          {type.icon}
                        </div>
                        <span className="font-medium">{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-semibold text-blue-800">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bought my first Base NFT"
                required
                className="h-12 border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 rounded-xl"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-semibold text-blue-800">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us more about your Base experience..."
                rows={4}
                className="border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 rounded-xl resize-none"
              />
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-blue-800">Photos</Label>
              <div className="space-y-4">
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo || "/placeholder.svg"}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl border-2 border-blue-200 shadow-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full shadow-lg"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPhoto}
                  className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Add Photo
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-blue-800">Tags</Label>
              <div className="space-y-4">
                {/* Current tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 hover:from-blue-200 hover:to-blue-300 transition-colors duration-300">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500 transition-colors duration-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add new tag */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="h-12 pl-12 border-2 border-blue-200 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(newTag)
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(newTag)}
                    disabled={!newTag.trim()}
                    className="h-12 px-6 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {/* Popular tags */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-blue-700">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTag(tag)}
                        disabled={tags.includes(tag)}
                        className="h-8 text-xs border border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 rounded-lg disabled:opacity-50"
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="public-toggle" className="text-base font-semibold text-blue-800">
                    Make this entry public
                  </Label>
                  <p className="text-sm text-blue-600">
                    Others can see this entry to get inspired by your Base journey
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-700"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Entry
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="h-12 px-8 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 rounded-xl"
              >
                <FileText className="w-5 h-5 mr-2" />
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
