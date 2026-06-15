import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { AD_SLOTS, validateSlotSlug } from '@/lib/ads/constants'
import { debugSlot } from '@/lib/ads/resolver'

/**
 * GET /api/admin/ad-slots/debug
 * GET /api/admin/ad-slots/debug?slot=TOP_HEADER_AD
 *
 * Admin-only debugging endpoint. For each slot returns:
 * - matched campaigns (live, cache bypassed)
 * - selected campaign
 * - reason for selection
 * - cache state
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // No need to query admin_accounts here as getSession already verified the token
    // which was signed with the adminId.

    const slotParam = request.nextUrl.searchParams.get('slot')

    if (slotParam) {
      if (!validateSlotSlug(slotParam)) {
        return NextResponse.json(
          { error: `Invalid slot: "${slotParam}"`, validSlots: AD_SLOTS },
          { status: 400 }
        )
      }
      const result = await debugSlot(slotParam)
      return NextResponse.json({ slots: [result] }, { status: 200 })
    }

    // Debug all slots
    const results = await Promise.all(AD_SLOTS.map(slot => debugSlot(slot)))
    return NextResponse.json({ slots: results }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error in ad debug API:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
