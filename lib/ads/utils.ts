import crypto from 'crypto'

/**
 * Generate deterministic impression ID to prevent duplicates
 * Uses: session_id + campaign_id + slot + time_bucket (5 min)
 */
export function generateImpressionId(
  campaignId: string,
  slotSlug: string,
  sessionId: string,
  timestamp: Date = new Date()
): string {
  // 5-minute time bucket for deduplication
  const timeBucket = Math.floor(timestamp.getTime() / (5 * 60 * 1000))

  const data = `${campaignId}:${slotSlug}:${sessionId}:${timeBucket}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Generate deterministic click ID to prevent duplicates
 * Uses: session_id + campaign_id + slot + time_bucket (30 sec)
 */
export function generateClickId(
  campaignId: string,
  slotSlug: string,
  sessionId: string,
  timestamp: Date = new Date()
): string {
  // 30-second time bucket for click deduplication
  const timeBucket = Math.floor(timestamp.getTime() / (30 * 1000))

  const data = `${campaignId}:${slotSlug}:${sessionId}:${timeBucket}`
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Normalize campaign weights
 * - null → 1
 * - 0 or negative → 1 (ignore)
 * - Returns minimum valid weight of 1
 */
export function normalizeWeight(weight: number | null | undefined): number {
  if (!weight || weight <= 0) return 1
  return weight
}

/**
 * Validate date range for campaign
 * - start_date must be <= now
 * - end_date must be >= now (or null for indefinite)
 * - Uses UTC for all comparisons
 */
export function isCampaignActive(
  startDate: string | Date,
  endDate: string | Date | null
): boolean {
  const now = new Date()

  const start = new Date(startDate)
  if (isNaN(start.getTime())) return false

  // Campaign hasn't started yet
  if (start > now) return false

  // No end date = indefinite (always active if started)
  if (!endDate) return true

  const end = new Date(endDate)
  if (isNaN(end.getTime())) return false

  // Campaign has expired
  if (end < now) return false

  return true
}

/**
 * Weighted random selection
 * - Normalizes weights before selection
 * - Returns null if no campaigns available
 * - Deterministic within time window
 */
export function selectByWeight<T extends { weight?: number | null }>(
  items: T[],
  seed?: number
): T | null {
  if (!items || items.length === 0) return null

  // Normalize weights
  const normalized = items.map(item => ({
    item,
    weight: normalizeWeight(item.weight),
  }))

  // Calculate total weight
  const totalWeight = normalized.reduce((sum, n) => sum + n.weight, 0)

  if (totalWeight <= 0) return null

  // Weighted random selection
  let random = (seed ?? Math.random()) * totalWeight
  for (const { item, weight } of normalized) {
    random -= weight
    if (random <= 0) return item
  }

  // Fallback (should not happen)
  return normalized[0]?.item ?? null
}

/**
 * Rate limit check for ad clicks
 * Prevents duplicate clicks within time window
 * Returns true if click is allowed
 */
export function isClickAllowed(
  lastClickTime: number | null,
  minIntervalMs: number = 1000
): boolean {
  if (!lastClickTime) return true

  const now = Date.now()
  return now - lastClickTime >= minIntervalMs
}

/**
 * Create session ID from browser fingerprint
 * Used for impression deduplication across tabs
 */
export function getClientSessionId(): string {
  if (typeof window === 'undefined') return ''

  const key = '__ad_session_id'

  // Check if already stored
  let sessionId = localStorage.getItem(key)
  if (sessionId) return sessionId

  // Generate new session ID
  sessionId = crypto.randomUUID ? crypto.randomUUID() : generateRandomId()
  localStorage.setItem(key, sessionId)

  return sessionId
}

/**
 * Fallback random ID generation for browsers without randomUUID
 */
function generateRandomId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calculate CTR (click-through rate)
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0
  return (clicks / impressions) * 100
}
