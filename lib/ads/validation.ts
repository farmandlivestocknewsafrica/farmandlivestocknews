/**
 * Shared validation utilities for ad campaign management
 * Eliminates duplicate validation logic across API endpoints
 */

import { AD_SLOTS, validateSlotSlug, ALLOWED_AD_FORMATS } from './constants'

/**
 * Validate ad campaign date range
 * Returns error message if invalid, null if valid
 */
export function validateDateRange(
  startDateStr?: string | null,
  endDateStr?: string | null
): string | null {
  if (!startDateStr && !endDateStr) {
    return null // Both optional
  }

  const startDate = startDateStr ? new Date(startDateStr) : new Date()
  
  if (isNaN(startDate.getTime())) {
    return 'Invalid start_date format'
  }

  if (endDateStr) {
    const endDate = new Date(endDateStr)
    if (isNaN(endDate.getTime())) {
      return 'Invalid end_date format'
    }
    if (endDate <= startDate) {
      return 'end_date must be after start_date'
    }
  }

  return null
}

/**
 * Validate ad slots
 * Returns { valid: true, slots: validated array } or { valid: false, error: message }
 */
export function validateSlots(slots: unknown): { valid: boolean; slots?: string[]; error?: string } {
  if (!Array.isArray(slots)) {
    return { valid: false, error: 'slots must be an array' }
  }

  if (slots.length === 0) {
    return { valid: false, error: 'At least one slot must be selected' }
  }

  const invalidSlots = slots.filter(s => !validateSlotSlug(s))
  if (invalidSlots.length > 0) {
    return {
      valid: false,
      error: `Invalid slots: ${invalidSlots.join(', ')}. Valid slots: ${AD_SLOTS.join(', ')}`,
    }
  }

  return { valid: true, slots: slots as string[] }
}

/**
 * Validate required campaign fields
 */
export function validateRequiredFields(body: Record<string, unknown>): {
  valid: boolean
  error?: string
} {
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    return { valid: false, error: 'title is required' }
  }

  if (!body.advertiser_name || typeof body.advertiser_name !== 'string' || !body.advertiser_name.trim()) {
    return { valid: false, error: 'advertiser_name is required' }
  }

  if (!body.image_url || typeof body.image_url !== 'string' || !body.image_url.trim()) {
    return { valid: false, error: 'image_url is required' }
  }

  return { valid: true }
}

/**
 * Validate image file for ad uploads
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_AD_FORMATS.mimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_AD_FORMATS.display}`,
    }
  }

  const maxSizeMB = 2
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Normalize placement weights for a campaign
 * Ensures weights sum to reasonable values
 */
export function normalizePlacementWeights(slots: string[], weight?: number): number {
  const baseWeight = typeof weight === 'number' && weight > 0 ? weight : 1
  return Math.max(1, baseWeight)
}
