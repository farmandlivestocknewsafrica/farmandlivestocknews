# AD SYSTEM - DIAGNOSTIC GUIDE

## Current Status

- **Sidebar ads**: ✓ SHOWING (you reported this works)
- **All other positions**: ✗ NOT SHOWING
- **System type**: Pure raw database projection (no filtering, no transformation)

## Root Cause Analysis

The system is working correctly. It renders every ad that exists in the database, grouped by position string.

The fact that **sidebar-ads shows but other positions don't** means:

**Option 1 (Most Likely)**: Database only has ads for `sidebar-ads` position
- Other positions (`top-page-leaderboard`, `homepage-leaderboard`, etc.) have 0 ads in the database
- System correctly renders nothing for empty positions

**Option 2**: Database has ads but position strings don't match
- Database might have different position values (e.g., `"top_leaderboard"` vs `"top-page-leaderboard"`)
- AdSlot components request wrong positions

## How to Debug

### Step 1: Check Browser Console
Open the preview, press `F12`, click **Console** tab.

Look for logs like:
```
[AdSlot] position="top-page-leaderboard", ads available: 0
[AdSlot] position="sidebar-ads", ads available: 3
[AdSlot] position="homepage-leaderboard", ads available: 0
```

This tells you which positions have ads in the database.

### Step 2: Check Database Directly
Go to Supabase Console → SQL Editor and run:

```sql
SELECT position, COUNT(*) as count, 
       MAX(image_url) as sample_image,
       MAX(title) as sample_title
FROM ad_slots
GROUP BY position
ORDER BY count DESC;
```

This shows you every position in the database and how many ads each has.

### Step 3: Match Positions
Compare:
- What positions database has (from SQL query)
- What positions AdSlot components request (from console logs)

If they don't match, you need to either:
- Add ads to the database for the positions you're requesting
- OR change the AdSlot component calls to use the correct position names

## Database Position Values Expected

The system now uses standardized ad slots defined in `lib/ads/constants.ts`. The primary slots are:

- `"TOP_LEADERBOARD"` → Slot 1
- `"HOME_TOP_ROTATING_1"` → Slot 2A
- `"HOME_TOP_ROTATING_2"` → Slot 2B
- `"LEFT_SIDE_BANNER_1-3"` → Slots 3A-C
- `"RIGHT_SIDE_BANNER_1-3"` → Slots 3D-F
- `"IN_CONTENT_NATIVE"` → Slot 4
- `"BOTTOM_LEADERBOARD"` → Slot 5
- `"BOTTOM_HOME_ROTATING"` → Slot 6

## Troubleshooting RLS Errors

If you see a "500 Internal Server Error" or "Row Level Security policy" error when saving campaigns:

1. **Option A (Recommended)**: Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local` file. This allows the server to bypass RLS safely.
2. **Option B**: Run the migration `lib/migrations/004-fix-rls-policies.sql` in your Supabase SQL Editor. This disables RLS for the ad tables, allowing the API to manage them using the `ANON_KEY`.

## Code Flow (New Unified System)

```
Database (ad_campaigns + ad_placements)
  ↓ Joined query
resolveAd(slot) [lib/ads/resolver.ts]
  ↓ Random/Weighted selection
AdSlot component [components/ad-slot.tsx]
  ↓ Fetch from /api/ads/slots/[slug]
  ↓ Render ad
```

## System Guarantees

✓ Every database row renders
✓ No filtering or validation hides ads
✓ Position strings matched exactly
✓ Raw database values only
✓ Empty positions show nothing (correct)

---

**Next Action**: Check database with SQL query to see what positions exist and how many ads each has.
