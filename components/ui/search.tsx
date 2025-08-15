"use client"

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X, Hash, User, FileText, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface SearchResult {
  id: string
  type: 'post' | 'user' | 'tag'
  title: string
  description?: string
  image?: string
  stats?: {
    posts?: number
    followers?: number
    likes?: number
  }
  tags?: string[]
  date?: string
}

interface SearchProps {
  onResultSelect?: (result: SearchResult) => void
  placeholder?: string
  className?: string
}

export function Search({ onResultSelect, placeholder = "Search posts, users, tags...", className = '' }: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search function - currently returns empty results
  const performSearch = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return []

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // TODO: Implement real search API calls here
    // For now, return empty results
    return []
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true)
        const searchResults = await performSearch(query)
        setResults(searchResults)
        setIsSearching(false)
        setShowResults(true)
        setActiveIndex(-1)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        handleResultSelect(results[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setShowResults(false)
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result)
    setShowResults(false)
    setActiveIndex(-1)
    setQuery('')
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'post': return <FileText className="w-4 h-4" />
      case 'user': return <User className="w-4 h-4" />
      case 'tag': return <Hash className="w-4 h-4" />
    }
  }

  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'post': return 'text-blue-400'
      case 'user': return 'text-green-400'
      case 'tag': return 'text-purple-400'
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-slate-800/50 border border-slate-600 text-white rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 pixelated-text placeholder-slate-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 border border-slate-600 rounded-xl shadow-2xl backdrop-blur-sm z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-slate-400 pixelated-text">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                    index === activeIndex
                      ? 'bg-slate-700/50 border-l-4 border-blue-500'
                      : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getResultColor(result.type)}`}>
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white pixelated-text font-semibold truncate">
                          {result.title}
                        </h4>
                        {result.type === 'tag' && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30 pixelated-text text-xs">
                            Tag
                          </Badge>
                        )}
                      </div>
                      {result.description && (
                        <p className="text-slate-400 pixelated-text text-sm mb-2 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500 pixelated-text">
                        {result.date && <span>{result.date}</span>}
                        {result.stats?.posts && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {result.stats.posts} posts
                          </span>
                        )}
                        {result.stats?.followers && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {result.stats.followers} followers
                          </span>
                        )}
                        {result.stats?.likes && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {result.stats.likes} likes
                          </span>
                        )}
                      </div>
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {result.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              className="bg-blue-500/20 text-blue-300 border-blue-400/30 pixelated-text text-xs"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-6 text-center">
              <SearchIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 pixelated-text mb-2">No results found</p>
              <p className="text-slate-500 pixelated-text text-sm">
                Try searching for different keywords
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// Search filters component
export function SearchFilters({ 
  activeFilter, 
  onFilterChange 
}: { 
  activeFilter: 'all' | 'posts' | 'users' | 'tags'
  onFilterChange: (filter: 'all' | 'posts' | 'users' | 'tags') => void 
}) {
  const filters = [
    { id: 'all', label: 'All', icon: SearchIcon },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'users', label: 'Users', icon: User },
    { id: 'tags', label: 'Tags', icon: Hash }
  ] as const

  return (
    <div className="flex gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={`pixelated-text ${
              activeFilter === filter.id
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
