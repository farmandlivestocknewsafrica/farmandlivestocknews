'use client'

import { ReactNode } from 'react'

interface FeedLayoutProps {
  width?: 'sm' | 'md' | 'lg' | 'xl'
  layout?: 'stack' | 'grid'
  spacing?: 'compact' | 'normal' | 'relaxed'
  title?: string
  children: ReactNode
}

const spacingClasses = {
  compact: 'gap-4 md:gap-4',
  normal: 'gap-6 md:gap-8',
  relaxed: 'gap-8 md:gap-10'
}

/**
 * Feed Layout Component
 *
 * Responsive grid with proper column progression:
 * - Mobile: 1 column
 * - sm (640px): 2 columns
 * - lg (1024px): 3 columns
 * - xl (1280px): 3 columns (cards don't get wider)
 */
export function FeedLayout({
  layout = 'stack',
  spacing = 'normal',
  title,
  children
}: FeedLayoutProps) {
  const isGrid = layout === 'grid'
  const gridClass = isGrid 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'flex flex-col'

  return (
    <div className="w-full">
      {title && (
        <div className="mb-6 md:mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            {title}
          </h2>
        </div>
      )}

      <div className={`${gridClass} ${!isGrid ? spacingClasses[spacing] : ''}`}>
        {children}
      </div>
    </div>
  )
}