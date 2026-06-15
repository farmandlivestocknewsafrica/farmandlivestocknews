export type AdSlot = {
  slug: string
  title: string
  position: 'TOP_HEADER' | 'HOME_LEADERBOARD' | 'SIDE_LEFT' | 'SIDE_RIGHT' | 'ARTICLE_INLINE' | 'FOOTER'
  width: number
  height: number
  weight: number
  priority: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdCampaign = {
  id: string
  title: string
  description: string | null
  advertiser_name: string
  advertiser_url: string | null
  image_url: string
  image_path: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type AdPlacement = {
  id: string
  campaign_id: string
  slot_slug: string
  priority: number
  weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdImpression = {
  id: string
  campaign_id: string
  slot_slug: string
  user_ip: string | null
  user_agent: string | null
  created_at: string
}

export type AdClick = {
  id: string
  campaign_id: string
  slot_slug: string
  user_ip: string | null
  user_agent: string | null
  created_at: string
}

export type AdWithMetrics = AdCampaign & {
  impressions: number
  clicks: number
  ctr: number // click-through rate
}

export type AdForSlot = {
  id: string
  image_url: string
  advertiser_url: string | null
  title: string
  advertiser_name: string
}
