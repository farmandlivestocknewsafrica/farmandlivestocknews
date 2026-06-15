-- Rename ad slots to match the new inventory map
-- Based on the user provided layout image (2026-06-15)

-- 1. Update direct mappings
UPDATE ad_placements SET slot_slug = 'TOP_LEADERBOARD' WHERE slot_slug = 'TOP_HEADER_AD';
UPDATE ad_placements SET slot_slug = 'HOME_TOP_ROTATING_1' WHERE slot_slug = 'HOME_LEADERBOARD_PRIMARY';
UPDATE ad_placements SET slot_slug = 'HOME_TOP_ROTATING_2' WHERE slot_slug = 'HOME_LEADERBOARD_SECONDARY';
UPDATE ad_placements SET slot_slug = 'BOTTOM_HOME_ROTATING' WHERE slot_slug = 'BOTTOM_ROTATOR';

-- 2. Update sidebars (mapping existing consolidated ones to slot 1 of each side)
UPDATE ad_placements SET slot_slug = 'LEFT_SIDE_BANNER_1' WHERE slot_slug = 'LEFT_SIDEBAR';
UPDATE ad_placements SET slot_slug = 'RIGHT_SIDE_BANNER_1' WHERE slot_slug = 'RIGHT_SIDEBAR';

-- 3. Analytics data also uses slot_slug, so update those too for consistency
UPDATE ad_impressions SET slot_slug = 'TOP_LEADERBOARD' WHERE slot_slug = 'TOP_HEADER_AD';
UPDATE ad_impressions SET slot_slug = 'HOME_TOP_ROTATING_1' WHERE slot_slug = 'HOME_LEADERBOARD_PRIMARY';
UPDATE ad_impressions SET slot_slug = 'HOME_TOP_ROTATING_2' WHERE slot_slug = 'HOME_LEADERBOARD_SECONDARY';
UPDATE ad_impressions SET slot_slug = 'BOTTOM_HOME_ROTATING' WHERE slot_slug = 'BOTTOM_ROTATOR';
UPDATE ad_impressions SET slot_slug = 'LEFT_SIDE_BANNER_1' WHERE slot_slug = 'LEFT_SIDEBAR';
UPDATE ad_impressions SET slot_slug = 'RIGHT_SIDE_BANNER_1' WHERE slot_slug = 'RIGHT_SIDEBAR';

UPDATE ad_clicks SET slot_slug = 'TOP_LEADERBOARD' WHERE slot_slug = 'TOP_HEADER_AD';
UPDATE ad_clicks SET slot_slug = 'HOME_TOP_ROTATING_1' WHERE slot_slug = 'HOME_LEADERBOARD_PRIMARY';
UPDATE ad_clicks SET slot_slug = 'HOME_TOP_ROTATING_2' WHERE slot_slug = 'HOME_LEADERBOARD_SECONDARY';
UPDATE ad_clicks SET slot_slug = 'BOTTOM_HOME_ROTATING' WHERE slot_slug = 'BOTTOM_ROTATOR';
UPDATE ad_clicks SET slot_slug = 'LEFT_SIDE_BANNER_1' WHERE slot_slug = 'LEFT_SIDEBAR';
UPDATE ad_clicks SET slot_slug = 'RIGHT_SIDE_BANNER_1' WHERE slot_slug = 'RIGHT_SIDEBAR';
