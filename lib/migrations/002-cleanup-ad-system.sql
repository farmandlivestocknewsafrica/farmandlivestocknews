-- Cleanup redundant ad system tables
-- These were replaced by the unified ad_campaigns / ad_placements architecture

-- 1. Drop the redundant ad_slots table if it exists
-- Note: We keep the constants.ts AD_SLOTS registry as the single source of truth for slugs
DROP TABLE IF EXISTS ad_slots CASCADE;

-- 2. Ensure ad_campaigns has the image_path column if not already present
-- (Migration 001 already has it, but this is a safety check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ad_campaigns' AND column_name='image_path') THEN
        ALTER TABLE ad_campaigns ADD COLUMN image_path TEXT;
    END IF;
END $$;
