import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutEnhancerProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

export function LayoutEnhancer({
  children,
  className,
  spacing = 'md',
  padding = 'md',
  maxWidth = 'xl',
  centered = true
}: LayoutEnhancerProps) {
  return (
    <div className={cn(
      'w-full',
      centered && 'mx-auto',
      {
        // Max width classes
        'max-w-sm': maxWidth === 'sm',
        'max-w-md': maxWidth === 'md',
        'max-w-lg': maxWidth === 'lg',
        'max-w-xl': maxWidth === 'xl',
        'max-w-2xl': maxWidth === '2xl',
        'max-w-full': maxWidth === 'full',
        
        // Spacing classes
        'space-y-2 sm:space-y-3 lg:space-y-4': spacing === 'xs',
        'space-y-4 sm:space-y-6 lg:space-y-8': spacing === 'sm',
        'space-y-6 sm:space-y-8 lg:space-y-10': spacing === 'md',
        'space-y-8 sm:space-y-10 lg:space-y-12': spacing === 'lg',
        'space-y-10 sm:space-y-12 lg:space-y-16': spacing === 'xl',
        
        // Padding classes
        'p-0': padding === 'none',
        'p-4 sm:p-6 lg:p-8': padding === 'sm',
        'p-6 sm:p-8 lg:p-10': padding === 'md',
        'p-8 sm:p-10 lg:p-12': padding === 'lg',
        'p-10 sm:p-12 lg:p-16': padding === 'xl',
      },
      className
    )}>
      {children}
    </div>
  );
}

// Enhanced Section Component
interface EnhancedSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedSection({
  children,
  className,
  title,
  subtitle,
  spacing = 'md'
}: EnhancedSectionProps) {
  return (
    <section className={cn(
      'w-full',
      {
        'space-y-4 sm:space-y-6 lg:space-y-8': spacing === 'xs',
        'space-y-6 sm:space-y-8 lg:space-y-10': spacing === 'sm',
        'space-y-8 sm:space-y-10 lg:space-y-12': spacing === 'md',
        'space-y-10 sm:space-y-12 lg:space-y-16': spacing === 'lg',
        'space-y-12 sm:space-y-16 lg:space-y-20': spacing === 'xl',
      },
      className
    )}>
      {(title || subtitle) && (
        <div className="text-center mb-8 sm:mb-10">
          {title && (
            <h2 className="text-responsive-2xl font-bold text-white mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-responsive-base text-blue-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// Enhanced Grid Component
interface EnhancedGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  gap = 'md'
}: EnhancedGridProps) {
  return (
    <div className={cn(
      'grid',
      {
        // Column classes
        'grid-cols-1': cols.mobile === 1,
        'grid-cols-2': cols.mobile === 2,
        'grid-cols-3': cols.mobile === 3,
        'grid-cols-4': cols.mobile === 4,
        'sm:grid-cols-1': cols.tablet === 1,
        'sm:grid-cols-2': cols.tablet === 2,
        'sm:grid-cols-3': cols.tablet === 3,
        'sm:grid-cols-4': cols.tablet === 4,
        'md:grid-cols-1': cols.desktop === 1,
        'md:grid-cols-2': cols.desktop === 2,
        'md:grid-cols-3': cols.desktop === 3,
        'md:grid-cols-4': cols.desktop === 4,
        'lg:grid-cols-1': cols.large === 1,
        'lg:grid-cols-2': cols.large === 2,
        'lg:grid-cols-3': cols.large === 3,
        'lg:grid-cols-4': cols.large === 4,
        
        // Gap classes
        'gap-2 sm:gap-3 lg:gap-4': gap === 'xs',
        'gap-4 sm:gap-6 lg:gap-8': gap === 'sm',
        'gap-6 sm:gap-8 lg:gap-10': gap === 'md',
        'gap-8 sm:gap-10 lg:gap-12': gap === 'lg',
        'gap-10 sm:gap-12 lg:gap-16': gap === 'xl',
      },
      className
    )}>
      {children}
    </div>
  );
}
