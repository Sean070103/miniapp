"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Menu, X, Search, Bell, User, Settings, Home, Calendar, Calculator, BarChart3, Flame, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

// Enhanced responsive breakpoints
const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// Enhanced hook for responsive behavior
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [isLargeDesktop, setIsLargeDesktop] = React.useState(false)
  const [screenSize, setScreenSize] = React.useState({
    width: 0,
    height: 0
  })

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({ width, height })
      setIsMobile(width < BREAKPOINTS.md)
      setIsTablet(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg)
      setIsDesktop(width >= BREAKPOINTS.lg && width < BREAKPOINTS['2xl'])
      setIsLargeDesktop(width >= BREAKPOINTS['2xl'])
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isLargeDesktop,
    screenSize,
    breakpoints: BREAKPOINTS
  }
}

// Enhanced Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  centered?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = 'xl',
  padding = 'md',
  centered = true
}: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full",
      centered && "mx-auto",
      {
        // Max width classes
        'max-w-xs': maxWidth === 'xs',
        'max-w-sm': maxWidth === 'sm',
        'max-w-md': maxWidth === 'md',
        'max-w-lg': maxWidth === 'lg',
        'max-w-xl': maxWidth === 'xl',
        'max-w-2xl': maxWidth === '2xl',
        'max-w-full': maxWidth === 'full',
        
        // Padding classes
        'px-0': padding === 'none',
        'px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10': padding === 'sm',
        'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16': padding === 'md',
        'px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20': padding === 'lg',
        'px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24': padding === 'xl',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Enhanced Responsive Grid
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
    large?: number
  }
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  autoFit?: boolean
  autoFill?: boolean
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md',
  autoFit = false,
  autoFill = false
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      "grid",
      {
        // Auto-fit/fill classes
        'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]': autoFit,
        'grid-cols-[repeat(auto-fill,minmax(250px,1fr))]': autoFill,
        
        // Manual column classes with enhanced breakpoints
        'grid-cols-1': !autoFit && !autoFill && cols.mobile === 1,
        'grid-cols-2': !autoFit && !autoFill && cols.mobile === 2,
        'grid-cols-3': !autoFit && !autoFill && cols.mobile === 3,
        'grid-cols-4': !autoFit && !autoFill && cols.mobile === 4,
        'sm:grid-cols-1': !autoFit && !autoFill && cols.tablet === 1,
        'sm:grid-cols-2': !autoFit && !autoFill && cols.tablet === 2,
        'sm:grid-cols-3': !autoFit && !autoFill && cols.tablet === 3,
        'sm:grid-cols-4': !autoFit && !autoFill && cols.tablet === 4,
        'md:grid-cols-1': !autoFit && !autoFill && cols.tablet === 1,
        'md:grid-cols-2': !autoFit && !autoFill && cols.tablet === 2,
        'md:grid-cols-3': !autoFit && !autoFill && cols.tablet === 3,
        'md:grid-cols-4': !autoFit && !autoFill && cols.tablet === 4,
        'lg:grid-cols-1': !autoFit && !autoFill && cols.desktop === 1,
        'lg:grid-cols-2': !autoFit && !autoFill && cols.desktop === 2,
        'lg:grid-cols-3': !autoFit && !autoFill && cols.desktop === 3,
        'lg:grid-cols-4': !autoFit && !autoFill && cols.desktop === 4,
        'xl:grid-cols-1': !autoFit && !autoFill && cols.large === 1,
        'xl:grid-cols-2': !autoFit && !autoFill && cols.large === 2,
        'xl:grid-cols-3': !autoFit && !autoFill && cols.large === 3,
        'xl:grid-cols-4': !autoFit && !autoFill && cols.large === 4,
        '2xl:grid-cols-1': !autoFit && !autoFill && cols.large === 1,
        '2xl:grid-cols-2': !autoFit && !autoFill && cols.large === 2,
        '2xl:grid-cols-3': !autoFit && !autoFill && cols.large === 3,
        '2xl:grid-cols-4': !autoFit && !autoFill && cols.large === 4,
        
        // Gap classes with enhanced breakpoints
        'gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8': gap === 'xs',
        'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12': gap === 'sm',
        'gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16': gap === 'md',
        'gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20': gap === 'lg',
        'gap-12 sm:gap-16 md:gap-20 lg:gap-24 xl:gap-32': gap === 'xl',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Enhanced Responsive Card
interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  interactive?: boolean
}

export function ResponsiveCard({ 
  children, 
  className, 
  padding = 'md',
  hover = false,
  interactive = false
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      "glass-strong border border-white/10 rounded-2xl glow-primary",
      {
        // Padding classes
        'p-0': padding === 'none',
        'p-3 sm:p-4 lg:p-6': padding === 'sm',
        'p-4 sm:p-6 lg:p-8': padding === 'md',
        'p-6 sm:p-8 lg:p-12': padding === 'lg',
        'p-8 sm:p-12 lg:p-16': padding === 'xl',
        
        // Interactive classes
        'cursor-pointer transition-all duration-200': interactive,
        'hover:bg-white/10 hover:border-white/20 hover:shadow-lg': hover || interactive,
        'active:scale-95': interactive,
      },
      className
    )}>
      {children}
    </div>
  )
}

// Enhanced Responsive Text
interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  responsive?: boolean
}

export function ResponsiveText({ 
  children, 
  className, 
  size = 'base',
  weight = 'normal',
  responsive = true
}: ResponsiveTextProps) {
  return (
    <div className={cn(
      {
        // Size classes with enhanced breakpoints
        'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl': size === 'xs' && responsive,
        'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl': size === 'sm' && responsive,
        'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl': size === 'base' && responsive,
        'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl': size === 'lg' && responsive,
        'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl': size === 'xl' && responsive,
        'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl': size === '2xl' && responsive,
        'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl': size === '3xl' && responsive,
        'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl': size === '4xl' && responsive,
        'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl': size === '5xl' && responsive,
        
        // Non-responsive sizes
        'text-xs': size === 'xs' && !responsive,
        'text-sm': size === 'sm' && !responsive,
        'text-base': size === 'base' && !responsive,
        'text-lg': size === 'lg' && !responsive,
        'text-xl': size === 'xl' && !responsive,
        'text-2xl': size === '2xl' && !responsive,
        'text-3xl': size === '3xl' && !responsive,
        'text-4xl': size === '4xl' && !responsive,
        'text-5xl': size === '5xl' && !responsive,
        
        // Weight classes
        'font-light': weight === 'light',
        'font-normal': weight === 'normal',
        'font-medium': weight === 'medium',
        'font-semibold': weight === 'semibold',
        'font-bold': weight === 'bold',
        'font-extrabold': weight === 'extrabold',
      },
      className
    )}>
      {children}
    </div>
  )
}

// Enhanced Responsive Sidebar
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
  const { isMobile, isTablet } = useResponsive()

  const sidebarContent = (
    <div className="h-full bg-gradient-to-b from-blue-950/70 via-blue-900/60 to-blue-800/50 backdrop-blur-3xl border-r border-white/20 flex flex-col shadow-2xl shadow-blue-500/30 hover:shadow-blue-400/40 transition-all duration-500">
      {/* User Profile Section */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarFallback className="bg-blue-500 text-white text-sm sm:text-base">
              {userAddress.slice(2, 6).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium text-white truncate">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </p>
            <p className="text-xs sm:text-sm text-blue-100">Connected</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 sm:p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onItemClick(item.id)
                if (isMobile || isTablet) {
                  onOpenChange(false)
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-left transition-all duration-300 ease-out touch-friendly",
                {
                  "bg-blue-500/60 text-white border border-blue-300/70 shadow-lg shadow-blue-300/40 backdrop-blur-2xl hover:scale-105": isActive,
                  "text-white hover:bg-white/15 hover:text-white hover:scale-102": !isActive,
                }
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="text-sm sm:text-base font-medium truncate">
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 sm:p-6 border-t border-white/10 space-y-2">
        {/* Removed duplicate disconnect button - available in main settings */}
      </div>
    </div>
  )

  // Mobile/Tablet: Sheet overlay
  if (isMobile || isTablet) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="left" 
          className="w-80 sm:w-96 p-0 bg-transparent border-none"
        >
          {sidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Fixed sidebar
  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 h-full w-72 xl:w-80 transition-all duration-300",
      className
    )}>
      {sidebarContent}
    </div>
  )
}

// Enhanced Responsive Header
interface ResponsiveHeaderProps {
  title: string
  subtitle?: string
  onMenuClick: () => void
  userAddress: string
  className?: string
  actions?: React.ReactNode
}

export function ResponsiveHeader({
  title,
  subtitle,
  onMenuClick,
  userAddress,
  className,
  actions
}: ResponsiveHeaderProps) {
  const { isMobile, isTablet } = useResponsive()

  return (
    <header className={cn(
      "sticky top-0 z-30 bg-blue-950/40 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-blue-400/20",
      className
    )}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
            className="lg:hidden touch-friendly"
            >
            <Menu className="h-5 w-5" />
            </Button>
          
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-blue-300 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {actions}
          
          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex touch-friendly"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarFallback className="bg-blue-500 text-white text-xs sm:text-sm">
                {userAddress.slice(2, 6).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
    </header>
  )
}

// Responsive Button Component
interface ResponsiveButtonProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  fullWidth?: boolean
  touchFriendly?: boolean
}

export function ResponsiveButton({
  children, 
  className, 
  size = 'md',
  variant = 'default',
  fullWidth = false,
  touchFriendly = true
}: ResponsiveButtonProps) {
  return (
    <Button
      className={cn(
        {
          'w-full sm:w-auto': fullWidth,
          'min-h-[44px] min-w-[44px]': touchFriendly,
          'px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base': size === 'sm',
          'px-4 py-3 text-base sm:px-6 sm:py-4 sm:text-lg': size === 'md',
          'px-6 py-4 text-lg sm:px-8 sm:py-5 sm:text-xl': size === 'lg',
      },
      className
      )}
      variant={variant}
    >
      {children}
    </Button>
  )
}

// Responsive Input Component
interface ResponsiveInputProps {
  placeholder?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function ResponsiveInput({
  placeholder,
  className,
  size = 'md',
  fullWidth = true
}: ResponsiveInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={cn(
        "bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200",
        {
          'w-full': fullWidth,
          'px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base': size === 'sm',
          'px-4 py-3 text-base sm:px-6 sm:py-4 sm:text-lg': size === 'md',
          'px-6 py-4 text-lg sm:px-8 sm:py-5 sm:text-xl': size === 'lg',
        },
  className 
      )}
    />
  )
}

// Responsive Spacing Component
interface ResponsiveSpacingProps {
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  direction?: 'vertical' | 'horizontal'
}

export function ResponsiveSpacing({
  children,
  className,
  size = 'md',
  direction = 'vertical'
}: ResponsiveSpacingProps) {
  return (
    <div className={cn(
      {
        // Vertical spacing
        'space-y-1 sm:space-y-2': size === 'xs' && direction === 'vertical',
        'space-y-2 sm:space-y-4': size === 'sm' && direction === 'vertical',
        'space-y-4 sm:space-y-6': size === 'md' && direction === 'vertical',
        'space-y-6 sm:space-y-8': size === 'lg' && direction === 'vertical',
        'space-y-8 sm:space-y-12': size === 'xl' && direction === 'vertical',
        
        // Horizontal spacing
        'space-x-1 sm:space-x-2': size === 'xs' && direction === 'horizontal',
        'space-x-2 sm:space-x-4': size === 'sm' && direction === 'horizontal',
        'space-x-4 sm:space-x-6': size === 'md' && direction === 'horizontal',
        'space-x-6 sm:space-x-8': size === 'lg' && direction === 'horizontal',
        'space-x-8 sm:space-x-12': size === 'xl' && direction === 'horizontal',
      },
      className
    )}>
      {children}
    </div>
  )
}
