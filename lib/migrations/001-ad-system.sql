-- Ad Campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  advertiser_name TEXT NOT NULL,
  advertiser_url TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Placements (which campaigns appear in which slots)
CREATE TABLE IF NOT EXISTS ad_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  slot_slug TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  weight INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, slot_slug)
);

-- Ad Impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  slot_slug TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Clicks tracking
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  slot_slug TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for ad_campaigns
CREATE POLICY "ad_campaigns_select_all" ON ad_campaigns 
  FOR SELECT USING (true);

CREATE POLICY "ad_campaigns_insert_authenticated" ON ad_campaigns 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ad_campaigns_update_authenticated" ON ad_campaigns 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "ad_campaigns_delete_authenticated" ON ad_campaigns 
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for ad_placements
CREATE POLICY "ad_placements_select_all" ON ad_placements 
  FOR SELECT USING (true);

CREATE POLICY "ad_placements_insert_authenticated" ON ad_placements 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ad_placements_update_authenticated" ON ad_placements 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "ad_placements_delete_authenticated" ON ad_placements 
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for impressions/clicks (only inserts from app)
CREATE POLICY "ad_impressions_insert_public" ON ad_impressions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_clicks_insert_public" ON ad_clicks 
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_ad_campaigns_is_active ON ad_campaigns(is_active);
CREATE INDEX idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);
CREATE INDEX idx_ad_placements_campaign_id ON ad_placements(campaign_id);
CREATE INDEX idx_ad_placements_slot_slug ON ad_placements(slot_slug);
CREATE INDEX idx_ad_impressions_campaign_id ON ad_impressions(campaign_id);
CREATE INDEX idx_ad_clicks_campaign_id ON ad_clicks(campaign_id);
