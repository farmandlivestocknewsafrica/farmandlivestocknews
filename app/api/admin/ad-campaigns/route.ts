import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { AD_SLOTS } from '@/lib/ads/constants'
import { invalidateAdCache } from '@/lib/ads/resolver'
import {
  validateRequiredFields,
  validateDateRange,
  validateSlots,
  normalizePlacementWeights,
} from '@/lib/ads/validation'

/**
 * GET /api/admin/ad-campaigns
 * List all campaigns with their slot placements
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')

    let query = supabase
      .from('ad_campaigns')
      .select('*, ad_placements (id, slot_slug, weight, is_active)')
      .order('created_at', { ascending: false })

    if (isActive === 'true') {
      query = query.eq('is_active', true)
    } else if (isActive === 'false') {
      query = query.eq('is_active', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('[v0] Supabase error in GET /api/admin/ad-campaigns:', error)
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        hint: 'Make sure the ad_campaigns table exists and RLS allows reading. Run migrations/001-ad-system.sql if needed.'
      }, { status: 500 })
    }

    return NextResponse.json({ campaigns: data || [] }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error fetching campaigns:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/ad-campaigns
 * Create a campaign and assign it to slots.
 *
 * Body: { title, advertiser_name, advertiser_url?, image_url,
 *         start_date?, end_date?, priority?, is_active?, slots: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createAdminClient()

    // Validate required fields
    const requiredCheck = validateRequiredFields(body)
    if (!requiredCheck.valid) {
      return NextResponse.json({ error: requiredCheck.error }, { status: 400 })
    }

    // Validate date range
    const dateError = validateDateRange(body.start_date, body.end_date)
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 })
    }

    // Validate slots
    const slotCheck = validateSlots(body.slots)
    if (!slotCheck.valid) {
      return NextResponse.json({ error: slotCheck.error }, { status: 400 })
    }

    // Prepare dates
    const startDate = body.start_date ? new Date(body.start_date) : new Date()
    const endDate = body.end_date ? new Date(body.end_date) : null

    // Create campaign
    const { data: campaign, error } = await supabase
      .from('ad_campaigns')
      .insert({
        title: body.title.trim(),
        description: body.description || null,
        advertiser_name: body.advertiser_name.trim(),
        advertiser_url: body.advertiser_url?.trim() || null,
        image_url: body.image_url.trim(),
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        priority: typeof body.priority === 'number' ? body.priority : 0,
        is_active: body.is_active ?? true,
        created_by: session.adminId,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Supabase error in POST /api/admin/ad-campaigns:', error)
      
      let errorMessage = error.message
      if (error.code === '42501') { // RLS violation
        errorMessage = 'Database permission denied (RLS). Please ensure you have run the RLS fix migration or set the SUPABASE_SERVICE_ROLE_KEY.'
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          code: error.code,
          details: error.details,
          hint: error.hint || 'Make sure you have SUPABASE_SERVICE_ROLE_KEY set or RLS disabled for inserts.'
        }, 
        { status: 500 }
      )
    }

    // Create placements
    if (slotCheck.slots && slotCheck.slots.length > 0) {
      const weight = normalizePlacementWeights(slotCheck.slots, body.weight)
      const placements = slotCheck.slots.map(slot => ({
        campaign_id: campaign.id,
        slot_slug: slot,
        weight,
        is_active: true,
      }))

      const { error: placementError } = await supabase
        .from('ad_placements')
        .insert(placements)

      if (placementError) {
        console.error('[v0] Error creating placements:', placementError)
        return NextResponse.json(
          { campaign, warning: 'Campaign created but slot assignment failed' },
          { status: 201 }
        )
      }
    }

    // Invalidate cache
    invalidateAdCache()

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (err) {
    console.error('[v0] Error creating campaign:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
