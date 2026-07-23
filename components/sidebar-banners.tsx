'use client'

import { AdPlacement } from './ad-placement'
import { cn } from '@/lib/utils'

export function SidebarBanners({ side }: { side: 'left' | 'right' }) {
  const prefix = side === 'left' ? 'LEFT_SIDE_BANNER' : 'RIGHT_SIDE_BANNER'

  return (
    <aside
      className={cn(
        'hidden 2xl:block flex-shrink-0 w-[280px]',
        side === 'left' ? 'border-r border-border/30' : 'border-l border-border/30',
      )}
    >
      <div className="sticky top-24 space-y-4 px-3 pt-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <AdPlacement
            key={`${prefix}_${i}`}
            slug={`${prefix}_${i}`}
            width={280}
            height={900}
            variant="sidebar"
          />
        ))}
      </div>
    </aside>
  )
}
