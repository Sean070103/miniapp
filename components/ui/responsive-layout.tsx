"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, X, Search, Bell, User, Settings, Home, Calendar, Calculator, BarChart3, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

// Responsive breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// Hook for responsive behavior
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < BREAKPOINTS.md)
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
      setIsDesktop(width >= BREAKPOINTS.lg)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isMobile, isTablet, isDesktop }
}

// Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = 'xl' 
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      {
        'max-w-sm': maxWidth === 'sm',
        'max-w-md': maxWidth === 'md',
        'max-w-lg': maxWidth === 'lg',
        'max-w-xl': maxWidth === 'xl',
        'max-w-2xl': maxWidth === '2xl',
        'max-w-full': maxWidth === 'full',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Grid
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid",
      {
        'grid-cols-1': cols.mobile === 1,
        'grid-cols-2': cols.mobile === 2,
        'grid-cols-3': cols.mobile === 3,
        'grid-cols-4': cols.mobile === 4,
        'sm:grid-cols-1': cols.tablet === 1,
        'sm:grid-cols-2': cols.tablet === 2,
        'sm:grid-cols-3': cols.tablet === 3,
        'sm:grid-cols-4': cols.tablet === 4,
        'lg:grid-cols-1': cols.desktop === 1,
        'lg:grid-cols-2': cols.desktop === 2,
        'lg:grid-cols-3': cols.desktop === 3,
        'lg:grid-cols-4': cols.desktop === 4,
        'gap-2': gap === 'sm',
        'gap-4': gap === 'md',
        'gap-6': gap === 'lg',
        'gap-8': gap === 'xl',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Sidebar
interface SidebarItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

interface ResponsiveSidebarProps {
  items: SidebarItem[]
  activeItem: string
  onItemClick: (id: string) => void
  userAddress: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function ResponsiveSidebar({
  items,
  activeItem,
  onItemClick,
  userAddress,
  isOpen,
  onOpenChange,
  className
}: ResponsiveSidebarProps) {
  const { isMobile } = useResponsive()

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900/95 border-r border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <img src="/db-removebg.png" alt="DailyBase Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
          <h2 className="text-lg sm:text-xl font-bold text-white pixelated-text">DailyBase</h2>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              onClick={() => {
                onItemClick(item.id)
                if (isMobile) onOpenChange(false)
              }}
              variant={activeItem === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left pixelated-text relative",
                activeItem === item.id
                  ? "bg-blue-600 text-white"
                  : "text-blue-300 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className="ml-auto bg-blue-500/20 text-blue-300 border-blue-400/30"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
              {userAddress.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
            <p className="text-xs text-slate-400">Connected</p>
          </div>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50", className)}>
      <SidebarContent />
    </div>
  )
}

// Responsive Header
interface ResponsiveHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  onMenuClick?: () => void
  userAddress: string
  className?: string
}

export function ResponsiveHeader({
  title,
  subtitle,
  actions,
  onMenuClick,
  userAddress,
  className
}: ResponsiveHeaderProps) {
  const { isMobile } = useResponsive()

  return (
    <div className={cn(
      "bg-slate-900/95 border-b border-slate-700",
      isMobile ? "p-4" : "p-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isMobile && onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className={cn(
              "font-bold text-white pixelated-text",
              isMobile ? "text-lg" : "text-2xl"
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                "text-blue-300 pixelated-text",
                isMobile ? "text-sm" : "text-base"
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {actions}
          {isMobile && (
            <>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
            </>
          )}
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm">
              {userAddress.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

// Responsive Card
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function ResponsiveCard({ 
  children, 
  className, 
  padding = 'md' 
}: ResponsiveCardProps) {
  const { isMobile } = useResponsive()

  return (
    <div className={cn(
      "bg-slate-800/50 border border-slate-600 text-white backdrop-blur-sm card-glass",
      {
        'p-3': padding === 'sm' || isMobile,
        'p-4': padding === 'md' && !isMobile,
        'p-6': padding === 'lg' && !isMobile,
      },
      className
    )}>
      {children}
    </div>
  )
}

// Responsive Text
interface ResponsiveTextProps {
  children: React.ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption'
  className?: string
}

export function ResponsiveText({ 
  children, 
  variant = 'body', 
  className 
}: ResponsiveTextProps) {
  const { isMobile } = useResponsive()

  const baseClasses = "pixelated-text"
  const variantClasses = {
    h1: isMobile ? "text-2xl" : "text-4xl",
    h2: isMobile ? "text-xl" : "text-3xl", 
    h3: isMobile ? "text-lg" : "text-2xl",
    h4: isMobile ? "text-base" : "text-xl",
    body: isMobile ? "text-sm" : "text-base",
    caption: isMobile ? "text-xs" : "text-sm"
  }

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  )
}
