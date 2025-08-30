export interface JournalEntry {
  id: string
  baseUserId: string
  journal: string
  tags: string[]
  photos?: string[]
  likes?: number
  privacy?: string
  mood?: number
  weather?: string
  location?: string
  category?: string
  isGratitude?: boolean
  isGoal?: boolean
  isDream?: boolean
  prompt?: string
  dateCreated: Date
}
