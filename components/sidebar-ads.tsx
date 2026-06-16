import { AdSlot } from '@/components/ad-slot'

export function SidebarAds({ side }: { side: 'left' | 'right' }) {
  const slots = Array.from({ length: 3 }, (_, i) => `${side.toUpperCase()}_SIDE_BANNER_${i + 1}`)
  return (
    <div className="flex flex-col gap-4">
      {slots.map(slug => (
        <div key={slug} className="w-[300px] h-[600px]">
          <AdSlot slug={slug} />
        </div>
      ))}
    </div>
  )
}
