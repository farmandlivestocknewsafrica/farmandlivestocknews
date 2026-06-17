'use client'

import { AdPlacement } from './ad-placement'
import { cn } from '@/lib/utils'

export function SidebarBanners({ side }: { side: 'left' | 'right' }) {
  const prefix = side === 'left' ? 'LEFT_SIDE_BANNER' : 'RIGHT_SIDE_BANNER'

  return (
    <aside
      className={cn(
        'hidden 2xl:block flex-shrink-0 w-[160px]',
        side === 'left' ? 'border-r border-border/30' : 'border-l border-border/30',
      )}
    >
      <div className="sticky top-24 space-y-6 px-3 pt-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <AdPlacement
            key={`${prefix}_${i}`}
            slug={`${prefix}_${i}`}
            width={160}
            height={600}
            variant="sidebar"
          />
        ))}
      </div>
    </aside>
  )
}