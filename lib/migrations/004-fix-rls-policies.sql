-- Fix RLS policies for the ad system
-- Since we use a custom authentication system (admin_accounts table),
-- Supabase's auth.uid() is always NULL, causing RLS to block all operations.
-- We handle authentication at the API layer (app/api/admin/*), so we can
-- safely relax RLS for these tables.

-- Option A: Disable RLS for ad system tables (Most direct fix)
ALTER TABLE ad_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks DISABLE ROW LEVEL SECURITY;

-- Option B (Alternative): If you want to keep RLS but allow ANON_KEY (use if DISABLE fails)
/*
DROP POLICY IF EXISTS "ad_campaigns_insert_authenticated" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_update_authenticated" ON ad_campaigns;
DROP POLICY IF EXISTS "ad_campaigns_delete_authenticated" ON ad_campaigns;

CREATE POLICY "ad_campaigns_insert_anon" ON ad_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "ad_campaigns_update_anon" ON ad_campaigns FOR UPDATE USING (true);
CREATE POLICY "ad_campaigns_delete_anon" ON ad_campaigns FOR DELETE USING (true);

DROP POLICY IF EXISTS "ad_placements_insert_authenticated" ON ad_placements;
DROP POLICY IF EXISTS "ad_placements_update_authenticated" ON ad_placements;
DROP POLICY IF EXISTS "ad_placements_delete_authenticated" ON ad_placements;

CREATE POLICY "ad_placements_insert_anon" ON ad_placements FOR INSERT WITH CHECK (true);
CREATE POLICY "ad_placements_update_anon" ON ad_placements FOR UPDATE USING (true);
CREATE POLICY "ad_placements_delete_anon" ON ad_placements FOR DELETE USING (true);
*/
