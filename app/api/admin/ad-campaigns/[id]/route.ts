import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { AD_SLOTS } from '@/lib/ads/constants'
import { invalidateAdCache } from '@/lib/ads/resolver'
import {
  validateDateRange,
  validateSlots,
  normalizePlacementWeights,
} from '@/lib/ads/validation'

/**
 * PUT /api/admin/ad-campaigns/[id]
 * Update a campaign and optionally re-assign slots.
 * Invalidates resolver cache on success.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = await createAdminClient()

    // Validate dates if provided
    const dateError = validateDateRange(body.start_date, body.end_date)
    if (dateError) {
      return NextResponse.json({ error: dateError }, { status: 400 })
    }

    // Build updates object, trimming string values
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) updates.title = body.title?.trim() || ''
    if (body.description !== undefined) updates.description = body.description || null
    if (body.advertiser_name !== undefined) updates.advertiser_name = body.advertiser_name?.trim() || ''
    if (body.advertiser_url !== undefined) updates.advertiser_url = body.advertiser_url?.trim() || null
    if (body.image_url !== undefined) updates.image_url = body.image_url?.trim() || ''
    if (body.start_date !== undefined) updates.start_date = body.start_date
    if (body.end_date !== undefined) updates.end_date = body.end_date
    if (body.priority !== undefined) updates.priority = body.priority
    if (body.is_active !== undefined) updates.is_active = body.is_active

    const { data, error } = await supabase
      .from('ad_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Supabase error in PUT /api/admin/ad-campaigns/[id]:', error)
      let errorMessage = error.message
      if (error.code === '42501') { // RLS violation
        errorMessage = 'Database permission denied (RLS). Please ensure you have run the RLS fix migration or set the SUPABASE_SERVICE_ROLE_KEY.'
      }
      return NextResponse.json({ 
        error: errorMessage,
        hint: 'Update failed. Check if SUPABASE_SERVICE_ROLE_KEY is set correctly or RLS is disabled.'
      }, { status: 500 })
    }
    if (Array.isArray(body.slots)) {
      const slotCheck = validateSlots(body.slots)
      if (!slotCheck.valid) {
        return NextResponse.json({ error: slotCheck.error }, { status: 400 })
      }

      // Delete existing placements
      await supabase.from('ad_placements').delete().eq('campaign_id', id)

      // Create new placements
      if (slotCheck.slots && slotCheck.slots.length > 0) {
        const weight = normalizePlacementWeights(slotCheck.slots, body.weight)
        const placements = slotCheck.slots.map(slot => ({
          campaign_id: id,
          slot_slug: slot,
          weight,
          is_active: true,
        }))
        
        const { error: placementError } = await supabase
          .from('ad_placements')
          .insert(placements)
        
        if (placementError) {
          console.error('[v0] Error updating placements:', placementError)
          return NextResponse.json(
            { campaign: data, warning: 'Campaign updated but slot reassignment failed' },
            { status: 200 }
          )
        }
      }
    }

    // Invalidate cache
    invalidateAdCache()

    return NextResponse.json({ campaign: data }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error updating campaign:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/ad-campaigns/[id]
 * Delete a campaign (placements cascade). Invalidates resolver cache.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('ad_campaigns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Supabase error in DELETE /api/admin/ad-campaigns/[id]:', error)
      let errorMessage = error.message
      if (error.code === '42501') { // RLS violation
        errorMessage = 'Database permission denied (RLS). Please ensure you have run the RLS fix migration or set the SUPABASE_SERVICE_ROLE_KEY.'
      }
      return NextResponse.json({ 
        error: errorMessage,
        hint: 'Delete failed. Check if SUPABASE_SERVICE_ROLE_KEY is set correctly or RLS is disabled.'
      }, { status: 500 })
    }

    invalidateAdCache()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('[v0] Error deleting campaign:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
