/**
 * LEGACY AD SYSTEM STUB
 * 
 * This file is maintained for backward compatibility and build stability.
 * The active ad system has been migrated to the unified slug-based architecture:
 * - API: /api/ads/slots/[slug]
 * - Logic: /lib/ads/resolver.ts
 * - Constants: /lib/ads/constants.ts
 */

export type AdPosition = string;

export type Ad = {
  id: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  position: string;
};

/**
 * Safe fallback for legacy calls.
 * New code should use the unified resolver in @/lib/ads/resolver
 */
export async function getAdsForPosition(position: AdPosition): Promise<Ad[]> {
  console.warn(`[v0] Legacy call to getAdsForPosition("${position}"). Please migrate to the new slug-based system.`);
  return [];
}
