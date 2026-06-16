'use client'

import { ReactNode } from 'react'

interface FeedLayoutProps {
  /**
   * Feed container width constraint
   * Default: "md" (728px)
   */
  width?: 'sm' | 'md' | 'lg' | 'xl'
  
  /**
   * Layout mode: 'stack' for vertical or 'grid' for side-by-side
   */
  layout?: 'stack' | 'grid'
  
  /**
   * Vertical spacing between items
   * mobile, tablet, desktop breakpoints
   */
  spacing?: 'compact' | 'normal' | 'relaxed'
  
  /**
   * Feed title (optional)
   */
  title?: string
  
  /**
   * Feed content children
   */
  children: ReactNode
}

const widthClasses = {
  sm: 'max-w-sm',      // 24rem / 384px
  md: 'max-w-2xl',     // 42rem / 672px
  lg: 'max-w-4xl',     // 56rem / 896px
  xl: 'max-w-6xl'      // 72rem / 1152px
}

const spacingClasses = {
  compact: 'gap-4 md:gap-4',
  normal: 'gap-6 md:gap-8',
  relaxed: 'gap-8 md:gap-10'
}

/**
 * Feed Layout Component
 * 
 * Supports:
 * - Stack mode: vertical single-column layout
 * - Grid mode: side-by-side cards with responsive columns
 * - Consistent width, spacing, and centering
 * - Proper spacing between items
 */
export function FeedLayout({
  width = 'md',
  layout = 'stack',
  spacing = 'normal',
  title,
  children
}: FeedLayoutProps) {
  const isGrid = layout === 'grid'
  const gridClass = isGrid 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
    : 'flex flex-col'

  return (
    <div className="w-full">
      {title && (
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            {title}
          </h2>
        </div>
      )}

      <div className="mx-auto">
        <div className={`${gridClass} ${spacingClasses[spacing]}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
