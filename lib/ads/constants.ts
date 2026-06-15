/**
 * AD SLOT REGISTRY - Single source of truth for all ad slots
 *
 * Maps directly to the Farm & Livestock News Africa inventory map.
 * Synchronized across: frontend components, backend API/resolver, and DB placements.
 */

export const AD_SLOTS = [
  // 1. TOP LEADERBOARD BANNER - 728x90
  'TOP_LEADERBOARD',

  // 2A / 2B. HOME TOP ROTATING LEADERBOARDS - 1536x190
  'HOME_TOP_ROTATING_1',
  'HOME_TOP_ROTATING_2',

  // 3A-3C. LEFT SIDE BANNERS - 300x600
  'LEFT_SIDE_BANNER_1',
  'LEFT_SIDE_BANNER_2',
  'LEFT_SIDE_BANNER_3',

  // 3D-3F. RIGHT SIDE BANNERS - 300x600
  'RIGHT_SIDE_BANNER_1',
  'RIGHT_SIDE_BANNER_2',
  'RIGHT_SIDE_BANNER_3',

  // 4. IN-CONTENT NATIVE BANNER - 728x90
  'IN_CONTENT_NATIVE',

  // 5. BOTTOM LEADERBOARD BANNER - 728x90
  'BOTTOM_LEADERBOARD',

  // 6. BOTTOM HOME ROTATING LEADERBOARD - 1536x190
  'BOTTOM_HOME_ROTATING',

  // Article page slots - 728x90
  'ARTICLE_TOP',
  'ARTICLE_MIDDLE',
  'ARTICLE_BOTTOM',

  // Mobile-specific slots
  'MOBILE_HEADER', // 320x100
  'MOBILE_STICKY', // 320x50
  'MOBILE_INLINE', // 300x250
] as const

export type AdSlotType = typeof AD_SLOTS[number]

/**
 * Validate that a given slug is a known slot
 */
export function validateSlotSlug(slug: string): slug is AdSlotType {
  return AD_SLOTS.includes(slug as AdSlotType)
}

/**
 * Get all valid slot slugs
 */
export function getValidSlots(): AdSlotType[] {
  return AD_SLOTS as unknown as AdSlotType[]
}

export type SlotScope = 'global' | 'homepage' | 'article' | 'mobile'

/**
 * Allowed ad file formats for uploads
 */
export const ALLOWED_AD_FORMATS = {
  mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  display: 'PNG, JPG, GIF, WebP (max 2MB)',
} as const

/**
 * Slot configuration and metadata
 */
export const SLOT_CONFIG: Record<AdSlotType, {
  title: string
  description: string
  defaultWidth: number
  defaultHeight: number
  scope: SlotScope
  position: string
  rotating: boolean
}> = {
  TOP_LEADERBOARD: {
    title: '1. TOP LEADERBOARD BANNER',
    description: 'Between search button and navigation (Right aligned)',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'global',
    position: 'header-right',
    rotating: false,
  },
  HOME_TOP_ROTATING_1: {
    title: '2A. HOME TOP ROTATING LEADERBOARD - OPTION 1',
    description: 'Below navigation bar (Rotating/Slider Banner)',
    defaultWidth: 1536,
    defaultHeight: 190,
    scope: 'homepage',
    position: 'home-top-1',
    rotating: true,
  },
  HOME_TOP_ROTATING_2: {
    title: '2B. HOME TOP ROTATING LEADERBOARD - OPTION 2',
    description: 'Below the first rotating banner (Rotating/Slider Banner)',
    defaultWidth: 1536,
    defaultHeight: 190,
    scope: 'homepage',
    position: 'home-top-2',
    rotating: true,
  },
  LEFT_SIDE_BANNER_1: {
    title: '3A. LEFT SIDE BANNER 1',
    description: 'Left Sidebar - Top',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'left-sidebar-top',
    rotating: false,
  },
  LEFT_SIDE_BANNER_2: {
    title: '3B. LEFT SIDE BANNER 2',
    description: 'Left Sidebar - Middle',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'left-sidebar-middle',
    rotating: false,
  },
  LEFT_SIDE_BANNER_3: {
    title: '3C. LEFT SIDE BANNER 3',
    description: 'Left Sidebar - Bottom',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'left-sidebar-bottom',
    rotating: false,
  },
  RIGHT_SIDE_BANNER_1: {
    title: '3D. RIGHT SIDE BANNER 1',
    description: 'Right Sidebar - Top',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'right-sidebar-top',
    rotating: false,
  },
  RIGHT_SIDE_BANNER_2: {
    title: '3E. RIGHT SIDE BANNER 2',
    description: 'Right Sidebar - Middle',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'right-sidebar-middle',
    rotating: false,
  },
  RIGHT_SIDE_BANNER_3: {
    title: '3F. RIGHT SIDE BANNER 3',
    description: 'Right Sidebar - Bottom',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'homepage',
    position: 'right-sidebar-bottom',
    rotating: false,
  },
  IN_CONTENT_NATIVE: {
    title: '4. IN-CONTENT NATIVE BANNER',
    description: 'In between articles/content',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'homepage',
    position: 'home-inline',
    rotating: true,
  },
  BOTTOM_LEADERBOARD: {
    title: '5. BOTTOM LEADERBOARD BANNER',
    description: 'Above the bottom rotating banner',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'homepage',
    position: 'home-bottom',
    rotating: false,
  },
  BOTTOM_HOME_ROTATING: {
    title: '6. BOTTOM HOME ROTATING LEADERBOARD',
    description: 'Bottom of the homepage (Rotating/Slider Banner)',
    defaultWidth: 1536,
    defaultHeight: 190,
    scope: 'homepage',
    position: 'home-bottom-rotator',
    rotating: true,
  },
  ARTICLE_TOP: {
    title: 'Article Top Banner',
    description: 'Top of article body, below the headline',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'article',
    position: 'article-top',
    rotating: true,
  },
  ARTICLE_MIDDLE: {
    title: 'Article Middle Banner',
    description: 'Injected mid-way through article content',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'article',
    position: 'article-middle',
    rotating: true,
  },
  ARTICLE_BOTTOM: {
    title: 'Article Bottom Banner',
    description: 'End of article before related stories',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'article',
    position: 'article-bottom',
    rotating: true,
  },
  MOBILE_HEADER: {
    title: 'Mobile Header Banner',
    description: 'Top banner on mobile viewports',
    defaultWidth: 320,
    defaultHeight: 100,
    scope: 'mobile',
    position: 'mobile-header',
    rotating: true,
  },
  MOBILE_STICKY: {
    title: 'Mobile Sticky Footer',
    description: 'Sticky anchored banner at bottom of mobile viewport',
    defaultWidth: 320,
    defaultHeight: 50,
    scope: 'mobile',
    position: 'mobile-sticky',
    rotating: true,
  },
  MOBILE_INLINE: {
    title: 'Mobile Inline Banner',
    description: 'Inline rectangle within mobile content feed',
    defaultWidth: 300,
    defaultHeight: 250,
    scope: 'mobile',
    position: 'mobile-inline',
    rotating: true,
  },
}
