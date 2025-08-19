"use client"

import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image, 
  Smile,
  AtSign,
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  className?: string
  onTagAdd?: (tag: string) => void
  onMentionAdd?: (username: string) => void
  tags?: string[]
  mentions?: string[]
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "What's happening on Base?",
  maxLength = 1000,
  className = "",
  onTagAdd,
  onMentionAdd,
  tags = [],
  mentions = []
}: RichTextEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const characterCount = value.length
  const remainingChars = maxLength - characterCount

  const formatText = (format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ''
    let newCursorPos = start

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        newCursorPos = start + 2
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        newCursorPos = start + 1
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        newCursorPos = start + 2
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        newCursorPos = start + 1
        break
      case 'quote':
        formattedText = `> ${selectedText}`
        newCursorPos = start + 2
        break
      case 'bullet':
        formattedText = `• ${selectedText}`
        newCursorPos = start + 2
        break
      case 'numbered':
        formattedText = `1. ${selectedText}`
        newCursorPos = start + 3
        break
      default:
        return
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Set cursor position after formatting
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length)
      }
    }, 0)
  }

  const insertLink = () => {
    if (!linkUrl.trim()) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`
    
    const newValue = value.substring(0, start) + linkMarkdown + value.substring(start)
    onChange(newValue)

    setLinkUrl('')
    setLinkText('')
    setIsLinkDialogOpen(false)

    // Set cursor position after link
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length)
      }
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Check for @ mentions
    const lastChar = newValue[e.target.selectionStart - 1]
    if (lastChar === '@') {
      setShowMentionSuggestions(true)
    } else if (lastChar === '#') {
      setShowTagSuggestions(true)
    } else {
      setShowMentionSuggestions(false)
      setShowTagSuggestions(false)
    }

    setCursorPosition(e.target.selectionStart)
  }

  const insertMention = (username: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const beforeMention = value.substring(0, cursorPosition - 1) // Remove the @
    const afterMention = value.substring(cursorPosition)
    const newValue = beforeMention + `@${username} ` + afterMention
    
    onChange(newValue)
    setShowMentionSuggestions(false)
    onMentionAdd?.(username)

    // Set cursor position after mention
    setTimeout(() => {
      if (textarea) {
        const newPos = beforeMention.length + username.length + 2
        textarea.focus()
        textarea.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const beforeTag = value.substring(0, cursorPosition - 1) // Remove the #
    const afterTag = value.substring(cursorPosition)
    const newValue = beforeTag + `#${tag} ` + afterTag
    
    onChange(newValue)
    setShowTagSuggestions(false)
    onTagAdd?.(tag)

    // Set cursor position after tag
    setTimeout(() => {
      if (textarea) {
        const newPos = beforeTag.length + tag.length + 2
        textarea.focus()
        textarea.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const newValue = value.substring(0, start) + emoji + value.substring(start)
    onChange(newValue)

    // Set cursor position after emoji
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }
    }, 0)
  }

  const emojis = ['😊', '🚀', '💎', '🔥', '⚡', '🎉', '💪', '🌟', '🎯', '💡']

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-lg border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('bullet')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('numbered')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('quote')}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText('code')}
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Input
                placeholder="Link text (optional)"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Button onClick={insertLink} className="w-full">
                Insert Link
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="w-px h-6 bg-gray-300" />

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowTagSuggestions(!showTagSuggestions)}
          >
            <Hash className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowMentionSuggestions(!showMentionSuggestions)}
          >
            <AtSign className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex gap-1">
          {emojis.map((emoji, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertEmoji(emoji)}
              className="h-8 w-8 p-0 text-lg"
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[120px] resize-none"
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {characterCount}/{maxLength}
        </div>
      </div>

      {/* Tag suggestions */}
      {showTagSuggestions && (
        <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto">
          <div className="text-sm font-medium mb-2">Popular tags:</div>
          <div className="space-y-1">
            {['crypto', 'base', 'defi', 'nft', 'web3', 'blockchain', 'trading', 'learning'].map((tag) => (
              <button
                key={tag}
                onClick={() => insertTag(tag)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mention suggestions */}
      {showMentionSuggestions && (
        <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-2 max-h-40 overflow-y-auto">
          <div className="text-sm font-medium mb-2">Suggestions:</div>
          <div className="space-y-1">
            {mentions.map((username) => (
              <button
                key={username}
                onClick={() => insertMention(username)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
              >
                @{username}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Remaining characters warning */}
      {remainingChars <= 50 && (
        <div className={`text-xs ${remainingChars <= 10 ? 'text-red-500' : 'text-yellow-600'}`}>
          {remainingChars} characters remaining
        </div>
      )}
    </div>
  )
}
