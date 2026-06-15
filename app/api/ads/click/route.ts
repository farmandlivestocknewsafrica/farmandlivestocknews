import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { validateSlotSlug } from '@/lib/ads/constants'
import { generateClickId } from '@/lib/ads/utils'

/**
 * POST /api/ads/click
 *
 * Tracks an ad click.
 * - Validates slot
 * - Deduplicated via deterministic id (30-second bucket)
 * - Requires a matching impression (prevents fake clicks)
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
      console.error(`[v0] Invalid slot in click tracking: "${slotSlug}"`)
      return NextResponse.json(
        { success: false, error: 'Invalid slot' },
        { status: 400 }
      )
    }

    const session =
      sessionId ||
      request.headers.get('x-session-id') ||
      `ip-${request.headers.get('x-forwarded-for') || 'unknown'}`

    const supabase = await createClient()

    // Clicks require a prior impression for this campaign+slot
    const { data: impressions, error: impError } = await supabase
      .from('ad_impressions')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('slot_slug', slotSlug)
      .limit(1)

    if (impError) {
      console.error('[v0] Error validating impression:', impError)
      return NextResponse.json(
        { success: false, error: 'Failed to validate click' },
        { status: 500 }
      )
    }

    if (!impressions || impressions.length === 0) {
      console.warn('[v0] Click without impression:', { campaignId, slotSlug })
      return NextResponse.json(
        { success: false, error: 'No matching impression found' },
        { status: 400 }
      )
    }

    const clickId = generateClickId(campaignId, slotSlug, session)

    const { error: clickError } = await supabase.from('ad_clicks').insert({
      id: clickId,
      campaign_id: campaignId,
      slot_slug: slotSlug,
      user_ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    })

    if (clickError) {
      if (clickError.code === '23505') {
        return NextResponse.json({ success: true, duplicate: true }, { status: 200 })
      }
      console.error('[v0] Error tracking click:', clickError)
      return NextResponse.json(
        { success: false, error: 'Failed to track click' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error in click API:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
