-- Fix: Migration 003 incorrectly renamed modern slot names to deprecated ones.
-- This reverses those changes to match the AD_SLOTS constants in lib/ads/constants.ts
-- Frontend validated against: AD_SLOTS array which uses MODERN names.

-- 1. Fix ad_placements - reverse the incorrect renames from migration 003
UPDATE ad_placements SET slot_slug = 'TOP_HEADER_AD' WHERE slot_slug = 'TOP_LEADERBOARD';
UPDATE ad_placements SET slot_slug = 'HOME_LEADERBOARD_PRIMARY' WHERE slot_slug = 'HOME_TOP_ROTATING_1';
UPDATE ad_placements SET slot_slug = 'HOME_LEADERBOARD_SECONDARY' WHERE slot_slug = 'HOME_TOP_ROTATING_2';
UPDATE ad_placements SET slot_slug = 'BOTTOM_ROTATOR' WHERE slot_slug = 'BOTTOM_HOME_ROTATING';

-- 2. Fix ad_impressions analytics data
UPDATE ad_impressions SET slot_slug = 'TOP_HEADER_AD' WHERE slot_slug = 'TOP_LEADERBOARD';
UPDATE ad_impressions SET slot_slug = 'HOME_LEADERBOARD_PRIMARY' WHERE slot_slug = 'HOME_TOP_ROTATING_1';
UPDATE ad_impressions SET slot_slug = 'HOME_LEADERBOARD_SECONDARY' WHERE slot_slug = 'HOME_TOP_ROTATING_2';
UPDATE ad_impressions SET slot_slug = 'BOTTOM_ROTATOR' WHERE slot_slug = 'BOTTOM_HOME_ROTATING';

-- 3. Fix ad_clicks analytics data
UPDATE ad_clicks SET slot_slug = 'TOP_HEADER_AD' WHERE slot_slug = 'TOP_LEADERBOARD';
UPDATE ad_clicks SET slot_slug = 'HOME_LEADERBOARD_PRIMARY' WHERE slot_slug = 'HOME_TOP_ROTATING_1';
UPDATE ad_clicks SET slot_slug = 'HOME_LEADERBOARD_SECONDARY' WHERE slot_slug = 'HOME_TOP_ROTATING_2';
UPDATE ad_clicks SET slot_slug = 'BOTTOM_ROTATOR' WHERE slot_slug = 'BOTTOM_HOME_ROTATING';