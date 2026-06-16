/**
 * AD SLOT REGISTRY - Single source of truth for all ad slots
 *
 * Maps directly to the Farm & Livestock News Africa inventory map.
 * Synchronized across: frontend components, backend API/resolver, and DB placements.
 */

export const AD_SLOTS = [
  // 0. TOP PAGE LEADERBOARD - 728x90 (Global - site-wide above navigation)
  'TOP_PAGE_LEADERBOARD',

  // 1. TOP HEADER AD - 728x90
  'TOP_HEADER_AD',

  // 2A / 2B. HOME TOP ROTATING LEADERBOARDS - 1536x190
  'HOME_LEADERBOARD_PRIMARY',
  'HOME_LEADERBOARD_SECONDARY',

  // 3A-3G. LEFT SIDE BANNERS - 300x600
  'LEFT_SIDE_BANNER_1',
  'LEFT_SIDE_BANNER_2',
  'LEFT_SIDE_BANNER_3',
  'LEFT_SIDE_BANNER_4',
  'LEFT_SIDE_BANNER_5',
  'LEFT_SIDE_BANNER_6',
  'LEFT_SIDE_BANNER_7',

  // 3H-3N. RIGHT SIDE BANNERS - 300x600
  'RIGHT_SIDE_BANNER_1',
  'RIGHT_SIDE_BANNER_2',
  'RIGHT_SIDE_BANNER_3',
  'RIGHT_SIDE_BANNER_4',
  'RIGHT_SIDE_BANNER_5',
  'RIGHT_SIDE_BANNER_6',
  'RIGHT_SIDE_BANNER_7',

  // 4. IN-CONTENT NATIVE BANNER - 728x90
  'IN_CONTENT_NATIVE',

  // 5. BOTTOM LEADERBOARD BANNER - 728x90
  'BOTTOM_LEADERBOARD',

  // 6. BOTTOM HOME ROTATING LEADERBOARD - 1536x190
  'BOTTOM_ROTATOR',

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
  TOP_PAGE_LEADERBOARD: {
    title: '0. TOP PAGE LEADERBOARD',
    description: 'Full-width leaderboard ABOVE header/navigation on ALL pages. Site-wide global slot.',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'global',
    position: 'site-top-above-nav',
    rotating: true,
  },
  TOP_HEADER_AD: {
    title: '1. TOP HEADER AD',
    description: 'Between search button and navigation (Right aligned)',
    defaultWidth: 728,
    defaultHeight: 90,
    scope: 'global',
    position: 'header-right',
    rotating: true,
  },
  HOME_LEADERBOARD_PRIMARY: {
    title: '2A. HOME LEADERBOARD PRIMARY',
    description: 'Below navigation bar, above featured content. Home page only.',
    defaultWidth: 970,
    defaultHeight: 250,
    scope: 'homepage',
    position: 'home-top-1',
    rotating: true,
  },
  HOME_LEADERBOARD_SECONDARY: {
    title: '2B. HOME LEADERBOARD SECONDARY',
    description: 'Below the first rotating banner (Rotating/Slider Banner)',
    defaultWidth: 1536,
    defaultHeight: 190,
    scope: 'homepage',
    position: 'home-top-2',
    rotating: true,
  },
  LEFT_SIDE_BANNER_1: {
    title: '3A. LEFT SIDE BANNER 1',
    description: 'Left Sidebar - Position 1',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-1',
    rotating: true,
  },
  LEFT_SIDE_BANNER_2: {
    title: '3B. LEFT SIDE BANNER 2',
    description: 'Left Sidebar - Position 2',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-2',
    rotating: true,
  },
  LEFT_SIDE_BANNER_3: {
    title: '3C. LEFT SIDE BANNER 3',
    description: 'Left Sidebar - Position 3',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-3',
    rotating: true,
  },
  LEFT_SIDE_BANNER_4: {
    title: '3D. LEFT SIDE BANNER 4',
    description: 'Left Sidebar - Position 4',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-4',
    rotating: true,
  },
  LEFT_SIDE_BANNER_5: {
    title: '3E. LEFT SIDE BANNER 5',
    description: 'Left Sidebar - Position 5',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-5',
    rotating: true,
  },
  LEFT_SIDE_BANNER_6: {
    title: '3F. LEFT SIDE BANNER 6',
    description: 'Left Sidebar - Position 6',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-6',
    rotating: true,
  },
  LEFT_SIDE_BANNER_7: {
    title: '3G. LEFT SIDE BANNER 7',
    description: 'Left Sidebar - Position 7',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'left-sidebar-7',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_1: {
    title: '3H. RIGHT SIDE BANNER 1',
    description: 'Right Sidebar - Position 1',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-1',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_2: {
    title: '3I. RIGHT SIDE BANNER 2',
    description: 'Right Sidebar - Position 2',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-2',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_3: {
    title: '3J. RIGHT SIDE BANNER 3',
    description: 'Right Sidebar - Position 3',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-3',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_4: {
    title: '3K. RIGHT SIDE BANNER 4',
    description: 'Right Sidebar - Position 4',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-4',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_5: {
    title: '3L. RIGHT SIDE BANNER 5',
    description: 'Right Sidebar - Position 5',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-5',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_6: {
    title: '3M. RIGHT SIDE BANNER 6',
    description: 'Right Sidebar - Position 6',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-6',
    rotating: true,
  },
  RIGHT_SIDE_BANNER_7: {
    title: '3N. RIGHT SIDE BANNER 7',
    description: 'Right Sidebar - Position 7',
    defaultWidth: 300,
    defaultHeight: 600,
    scope: 'global',
    position: 'right-sidebar-7',
    rotating: true,
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
    rotating: true,
  },
  BOTTOM_ROTATOR: {
    title: '6. BOTTOM ROTATOR',
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
