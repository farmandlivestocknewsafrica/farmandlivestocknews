import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateSlotSlug } from '@/lib/ads/constants'
import { generateImpressionId } from '@/lib/ads/utils'

/**
 * POST /api/ads/impression
 *
 * Tracks an impression when an ad enters the viewport.
 * Deduplicated via deterministic SHA256 id:
 * campaign + slot + session + 5-minute time bucket.
 */
export async function POST(request: NextRequest) {
  try {
    const { campaignId, slotSlug, sessionId } = await request.json()

    if (!campaignId || !slotSlug) {
      return NextResponse.json(
        { success: false, error: 'Missing campaignId or slotSlug' },
        { status: 400 }
      )
    }

    if (!validateSlotSlug(slotSlug)) {
      console.error(`[v0] Invalid slot in impression tracking: "${slotSlug}"`)
      return NextResponse.json(
        { success: false, error: 'Invalid slot' },
        { status: 400 }
      )
    }

    const session =
      sessionId ||
      request.headers.get('x-session-id') ||
      `ip-${request.headers.get('x-forwarded-for') || 'unknown'}`

    const impressionId = generateImpressionId(campaignId, slotSlug, session)

    const supabase = await createClient()
    const { error } = await supabase.from('ad_impressions').insert({
      id: impressionId,
      campaign_id: campaignId,
      slot_slug: slotSlug,
      user_ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    if (error) {
      // 23505 = unique violation = duplicate impression (expected, OK)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, duplicate: true }, { status: 200 })
      }
      console.error('[v0] Failed to track impression:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to track impression' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error in impression API:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
