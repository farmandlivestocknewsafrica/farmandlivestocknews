'use client'

import { AdSlot } from './ad-slot'

export function SidebarBanners({ side }: { side: 'left' | 'right' }) {
  const prefix = side === 'left' ? 'LEFT_SIDE_BANNER' : 'RIGHT_SIDE_BANNER'
  
  return (
    <aside className="hidden xl:block w-[160px] 2xl:w-[300px] flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={`${prefix}_${i}`} className="min-h-[100px] bg-muted/5 rounded flex items-center justify-center">
            <AdSlot 
              slug={`${prefix}_${i}`} 
              width={300} 
              height={600} 
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
