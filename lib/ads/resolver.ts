import { createClient } from '@/lib/supabase/server'
import { validateSlotSlug, SLOT_CONFIG, type AdSlotType } from '@/lib/ads/constants'
import { isCampaignActive, normalizeWeight, selectByWeight } from '@/lib/ads/utils'
import type { AdForSlot } from '@/lib/types/ads'

/**
 * AD RESOLUTION ENGINE - Core service for serving ads
 *
 * Selection rules (deterministic, no ambiguity):
 * 1. Only placements where placement.is_active = true
 * 2. Only campaigns where campaign.is_active = true
 *    AND start_date <= now AND (end_date IS NULL OR end_date >= now)
 * 3. If multiple candidates: highest campaign priority wins
 * 4. If priority tie: weighted random using placement weight (null/0 -> 1)
 * 5. If no candidates: returns null (frontend renders nothing/placeholder)
 *
 * Performance:
 * - In-memory TTL cache of candidate lists per slot
 *   - Rotating slots: 10s TTL for responsive rotation
 *   - Static slots: 45s TTL for performance
 * - Weighted random is applied per-request on the cached candidate list
 * - Cache invalidated on campaign/placement mutations via invalidateAdCache()
 */

export interface ResolvedCandidate {
  campaignId: string
  title: string
  imageUrl: string
  advertiserUrl: string | null
  advertiserName: string
  priority: number
  weight: number
  startDate: string
  endDate: string | null
}

interface CacheEntry {
  candidates: ResolvedCandidate[]
  fetchedAt: number
}

const STATIC_CACHE_TTL_MS = 45_000 // 45 seconds for non-rotating slots
const ROTATING_CACHE_TTL_MS = 10_000 // 10 seconds for rotating slots (aligns with 15s client interval)

// Module-level in-memory cache (per server instance)
const slotCache = new Map<string, CacheEntry>()

/**
 * Invalidate the resolver cache.
 * Call this whenever campaigns or placements are created/updated/deleted.
 */
export function invalidateAdCache(slotSlug?: string) {
  if (slotSlug) {
    slotCache.delete(slotSlug)
  } else {
    slotCache.clear()
  }
}

/**
 * Fetch all valid candidates for a slot from the database.
 */
async function fetchCandidates(slotSlug: AdSlotType): Promise<ResolvedCandidate[]> {
  const supabase = await createClient()

  console.log(`[AdResolver] Fetching candidates for slot: ${slotSlug}`)

  const { data: placements, error } = await supabase
    .from('ad_placements')
    .select(`
      id,
      campaign_id,
      weight,
      is_active,
      ad_campaigns (
        id,
        title,
        image_url,
        advertiser_url,
        advertiser_name,
        start_date,
        end_date,
        priority,
        is_active
      )
    `)
    .eq('slot_slug', slotSlug)
    .eq('is_active', true)

  if (error) {
    console.error(`[AdResolver] Error fetching placements for ${slotSlug}:`, error)
    return []
  }

  if (!placements || placements.length === 0) {
    console.log(`[AdResolver] No active placements found for slot: ${slotSlug}`)
    return []
  }

  console.log(`[AdResolver] Found ${placements.length} placements for ${slotSlug}. Evaluating campaigns...`)

  const candidates: ResolvedCandidate[] = []

  for (const placement of placements) {
    const campaign = placement.ad_campaigns as any
    if (!campaign) {
      console.log(`[AdResolver] Placement ${placement.id} has no associated campaign.`)
      continue
    }
    
    if (!campaign.is_active) {
      console.log(`[AdResolver] Campaign "${campaign.title}" (${campaign.id}) is inactive.`)
      continue
    }

    if (!isCampaignActive(campaign.start_date, campaign.end_date)) {
      console.log(`[AdResolver] Campaign "${campaign.title}" is outside of date range: ${campaign.start_date} to ${campaign.end_date}`)
      continue
    }

    if (!campaign.image_url) {
      console.log(`[AdResolver] Campaign "${campaign.title}" has no image_url. Skipping.`)
      continue // never serve broken creatives
    }

    console.log(`[AdResolver] Campaign "${campaign.title}" is ELIGIBLE.`)

    candidates.push({
      campaignId: campaign.id,
      title: campaign.title,
      imageUrl: campaign.image_url,
      advertiserUrl: campaign.advertiser_url || null,
      advertiserName: campaign.advertiser_name,
      priority: typeof campaign.priority === 'number' ? campaign.priority : 0,
      weight: normalizeWeight(placement.weight),
      startDate: campaign.start_date,
      endDate: campaign.end_date,
    })
  }

  console.log(`[AdResolver] Total eligible candidates for ${slotSlug}: ${candidates.length}`)
  return candidates
}

/**
 * Get candidates for a slot, using TTL cache.
 * Rotating slots use a shorter cache TTL for responsive rotation.
 */
async function getCandidates(slotSlug: AdSlotType): Promise<ResolvedCandidate[]> {
  const cached = slotCache.get(slotSlug)
  const now = Date.now()

  // Use appropriate TTL based on slot rotation config
  const config = SLOT_CONFIG[slotSlug]
  const ttl = config?.rotating ? ROTATING_CACHE_TTL_MS : STATIC_CACHE_TTL_MS

  if (cached && now - cached.fetchedAt < ttl) {
    return cached.candidates
  }

  const candidates = await fetchCandidates(slotSlug)
  slotCache.set(slotSlug, { candidates, fetchedAt: now })
  return candidates
}

/**
 * Apply deterministic selection rules to a candidate list:
 * highest priority first, weighted random among ties.
 */
export function selectCandidate(candidates: ResolvedCandidate[]): ResolvedCandidate | null {
  if (!candidates || candidates.length === 0) return null
  if (candidates.length === 1) {
    console.log(`[AdResolver] Automatically selected only candidate: "${candidates[0].title}"`)
    return candidates[0]
  }

  // Rule: highest priority wins
  const maxPriority = Math.max(...candidates.map(c => c.priority))
  const topTier = candidates.filter(c => c.priority === maxPriority)

  if (topTier.length === 1) {
    console.log(`[AdResolver] Selected highest priority (${maxPriority}) candidate: "${topTier[0].title}"`)
    return topTier[0]
  }

  // Rule: tie -> weighted random
  const selected = selectByWeight(topTier)
  console.log(`[AdResolver] Priority tie at ${maxPriority}. Weighted random selected: "${selected?.title}"`)
  return selected
}

/**
 * resolveAd - The core ad serving function.
 * Returns exactly ONE ad for the slot, or null if none qualify.
 */
export async function resolveAd(slotSlug: string): Promise<AdForSlot | null> {
  if (!validateSlotSlug(slotSlug)) {
    console.error(`[v0] Resolver: invalid slot "${slotSlug}"`)
    return null
  }

  const candidates = await getCandidates(slotSlug)
  const selected = selectCandidate(candidates)

  if (!selected) return null

  return {
    id: selected.campaignId,
    image_url: selected.imageUrl,
    advertiser_url: selected.advertiserUrl || '#',
    title: selected.title,
    advertiser_name: selected.advertiserName,
  }
}

/**
 * Debug info for a slot - used by /api/admin/ad-slots/debug
 */
export async function debugSlot(slotSlug: AdSlotType) {
  // Bypass cache for debug to show live data
  const candidates = await fetchCandidates(slotSlug)
  const selected = selectCandidate(candidates)

  let reason: string
  if (candidates.length === 0) {
    reason = 'No active campaigns assigned to this slot (or all outside date range)'
  } else if (candidates.length === 1) {
    reason = 'Only one eligible campaign'
  } else {
    const maxPriority = Math.max(...candidates.map(c => c.priority))
    const topTier = candidates.filter(c => c.priority === maxPriority)
    reason = topTier.length === 1
      ? `Highest priority (${maxPriority}) wins among ${candidates.length} candidates`
      : `Priority tie at ${maxPriority} among ${topTier.length} campaigns; weighted random applied`
  }

  const cached = slotCache.get(slotSlug)
  const config = SLOT_CONFIG[slotSlug]
  const ttl = config?.rotating ? ROTATING_CACHE_TTL_MS : STATIC_CACHE_TTL_MS

  return {
    slot: slotSlug,
    candidateCount: candidates.length,
    candidates: candidates.map(c => ({
      campaignId: c.campaignId,
      title: c.title,
      priority: c.priority,
      weight: c.weight,
      startDate: c.startDate,
      endDate: c.endDate,
    })),
    selected: selected
      ? { campaignId: selected.campaignId, title: selected.title, priority: selected.priority }
      : null,
    reason,
    cache: cached
      ? { ageMs: Date.now() - cached.fetchedAt, ttlMs: ttl }
      : { ageMs: null, ttlMs: ttl },
  }
}