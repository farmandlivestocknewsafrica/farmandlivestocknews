import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { AD_SLOTS } from '@/lib/ads/constants'

/**
 * GET /api/admin/ad-slots
 * Returns statistics for all ad slots
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Get active campaigns count
    const { data: activeCampaigns, error: campaignError, count: activeCampaignCount } = await supabase
      .from('ad_campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    if (campaignError) {
      console.error('[v0] Error fetching active campaigns:', campaignError)
      return NextResponse.json({ 
        error: campaignError.message,
        hint: 'Check if ad_campaigns table exists.'
      }, { status: 500 })
    }

    // Get impressions in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: impressions24h } = await supabase
      .from('ad_impressions')
      .select('slot_slug')
      .gte('created_at', twentyFourHoursAgo)

    // Group impressions by slot
    const impressionsBySlot: Record<string, number> = {}
    AD_SLOTS.forEach(slot => {
      impressionsBySlot[slot] = 0
    })

    if (impressions24h) {
      impressions24h.forEach(imp => {
        if (imp.slot_slug in impressionsBySlot) {
          impressionsBySlot[imp.slot_slug]++
        }
      })
    }

    // Get active campaigns per slot
    const { data: placements } = await supabase
      .from('ad_placements')
      .select('slot_slug, ad_campaigns(is_active)')
      .eq('is_active', true)

    const activeBySlot: Record<string, boolean> = {}
    if (placements) {
      placements.forEach(p => {
        if ((p.ad_campaigns as any)?.is_active) {
          activeBySlot[p.slot_slug] = true
        }
      })
    }

    const stats: Record<string, any> = {
      activeCampaigns: activeCampaignCount || 0,
      impressions24h: impressions24h?.length || 0,
    }

    // Add per-slot stats
    AD_SLOTS.forEach(slot => {
      stats[slot] = {
        impressions: impressionsBySlot[slot] || 0,
        hasActiveCampaign: activeBySlot[slot] || false,
      }
    })

    return NextResponse.json({ stats }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error fetching slot stats:', err)
    return NextResponse.json(
      { error: 'Failed to fetch slot statistics' },
      { status: 500 }
    )
  }
}
