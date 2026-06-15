import { createClient } from '@/lib/supabase/server'

/**
 * Seed initial ad campaigns and placements
 * Run this once to populate the ad system with the PAT ad
 */
export async function seedAdSystem() {
  const supabase = await createClient()

  try {
    // Create PAT (Tanzania Poultry Association) campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('ad_campaigns')
      .insert({
        title: 'The Tanzania Poultry Show 2026',
        description: 'PAT - Poultry Association of Tanzania. 10th Tanzania Poultry Show. October 16-17, 2026 at Ubungo Plaza, Dar es Salaam.',
        advertiser_name: 'Poultry Association of Tanzania (PAT)',
        advertiser_url: 'https://www.pat.or.tz/',
        image_url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/PHOTO-2026-06-11-15-34-34-vkSmomKSSfuwfx2uC6ifjpbyL50mTl.jpg',
        start_date: new Date('2026-01-01').toISOString(),
        end_date: new Date('2026-12-31').toISOString(),
        is_active: true,
      })
      .select()
      .single()

    if (campaignError) {
      console.error('[v0] Error creating campaign:', campaignError)
      return false
    }

    if (!campaign) {
      console.error('[v0] Campaign creation returned no data')
      return false
    }

    console.log('[v0] Created PAT campaign:', campaign.id)

    // Create placements for PAT in all slots
    const slots = ['top-header', 'home-leaderboard', 'side-left', 'side-right', 'article-inline', 'footer']
    const placements = slots.map(slot => ({
      campaign_id: campaign.id,
      slot_slug: slot,
      weight: 100,
      priority: 1,
      is_active: true,
    }))

    const { error: placementError } = await supabase
      .from('ad_placements')
      .insert(placements)

    if (placementError) {
      console.error('[v0] Error creating placements:', placementError)
      return false
    }

    console.log('[v0] Created PAT placements in', slots.length, 'slots')
    return true
  } catch (err) {
    console.error('[v0] Error seeding ad system:', err)
    return false
  }
}
