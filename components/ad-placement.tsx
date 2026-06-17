'use client'

import { cn } from '@/lib/utils'
import { validateSlotSlug, SLOT_CONFIG } from '@/lib/ads/constants'
import { AdSlot } from '@/components/ad-slot'

export type AdPlacementVariant = 'leaderboard' | 'native' | 'sidebar' | 'mobile'

interface AdPlacementProps {
  slug: string
  width?: number
  height?: number
  variant?: AdPlacementVariant
  className?: string
  /** Keep reserved height even when no ad is available (prevents layout shift) */
  reserveSpace?: boolean
}

/**
 * AdPlacement — document-flow ad container with reserved dimensions.
 * Never uses fixed/absolute positioning relative to the viewport.
 */
export function AdPlacement({
  slug,
  width,
  height,
  variant = 'leaderboard',
  className,
  reserveSpace = true,
}: AdPlacementProps) {
  const config = validateSlotSlug(slug) ? SLOT_CONFIG[slug] : null
  const adWidth = width ?? config?.defaultWidth ?? 300
  const adHeight = height ?? config?.defaultHeight ?? 250

  return (
    <div
      className={cn('ad-placement', `ad-placement--${variant}`, className)}
      style={reserveSpace ? { minHeight: adHeight } : undefined}
      data-ad-slot={slug}
      data-ad-variant={variant}
    >
      {variant === 'native' && (
        <p className="ad-placement__label">Sponsored</p>
      )}
      <AdSlot
        slug={slug}
        width={adWidth}
        height={adHeight}
        reserveSpace={reserveSpace}
      />
    </div>
  )
}

/** In-flow mobile banner — replaces deprecated fixed MOBILE_STICKY overlay */
export function MobileInlineAd({ className }: { className?: string }) {
  return (
    <div className={cn('md:hidden w-full py-4 flex justify-center border-t border-border', className)}>
      <AdPlacement slug="MOBILE_INLINE" variant="mobile" reserveSpace />
    </div>
  )
}
