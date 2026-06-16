-- Add TOP_PAGE_LEADERBOARD slot to the AD_SLOTS registry
-- This slot renders ABOVE the header/navigation on ALL pages as a global site-wide slot.
-- It is NOT part of the homepage layout — it's a global injection layer above navigation.

-- Insert the new slot into the ad_slots registry if it exists
DO $$
BEGIN
  -- Check if ad_slots table exists (optional registry)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ad_slots') THEN
    INSERT INTO ad_slots (slug, title, description, default_width, default_height, scope, position, rotating)
    VALUES (
      'TOP_PAGE_LEADERBOARD',
      'Top Page Leaderboard (Global)',
      'Full-width leaderboard above the header/navigation on all pages. Site-wide global slot.',
      728,
      90,
      'global',
      'site-top-above-nav',
      false
    )
    ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;