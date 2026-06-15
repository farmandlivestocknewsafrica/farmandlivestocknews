# AD SYSTEM - ROOT CAUSE ANALYSIS & FIX

## The Root Problem

The system was showing **placeholder images instead of real ads** because:

1. **Database contains placeholder URLs** like `https://via.placeholder.com/728x90?text=Crop+Nutrition`
2. **The frontend was "sanitizing" these URLs to fallback images** - converting them to `/ads/fallback-*.png`
3. **These fallback images were then displayed as if they were real ads**
4. **Result**: Placeholder images dominated the UI, real ads never showed

## The Fix (5 Steps)

### STEP 1: Removed Placeholder Sanitization (lib/server-ads.ts)
- **Before**: `sanitizeImageUrl()` converted placeholder URLs to `/ads/fallback-*.png`
- **After**: `isValidImageUrl()` only accepts real URLs (`https://`, `http://`, `/`)
- **Effect**: Ads with placeholder URLs are **rejected silently**, not converted to fallbacks

### STEP 2: Removed Fallback Image Rendering (components/ad-slot.tsx)
- **Before**: Showed `/ads/fallback-*.png` when no ads or images failed
- **After**: Returns `null` (empty) when no ads or images fail
- **Effect**: Empty slots remain empty - no fake "ad space" placeholders

### STEP 3: API Contracts Fixed (app/api/v1/)
- Click endpoint: `POST /api/v1/ad-slots/click` with `{ id }`
- Impression endpoint: `POST /api/v1/ad-slots/impression` with `{ id }`
- **Effect**: Unified, error-free tracking

### STEP 4: Database Mapping Verified (lib/canonical-ad-slots.ts)
- Maps DB position strings → CanonicalSlot enum:
  - `'top-page-leaderboard'` → `TOP_LEADERBOARD`
  - `'homepage-leaderboard'` → `HOMEPAGE_LEADERBOARD`
  - `'sidebar-ads'` → `SIDEBAR`
  - `'in-content-native-ad'` → `IN_CONTENT`
  - `'bottom-leaderboard'` → `BOTTOM_LEADERBOARD`
  - `'footer-leaderboard'` → `FOOTER_LEADERBOARD`
- **Effect**: All database ads normalize correctly to UI slots

### STEP 5: Single Data Pipeline Enforced
```
ad_slots (database)
    ↓
resolveAllAds() [runs in root layout]
    ↓
isValidImageUrl() validation [rejects bad URLs]
    ↓
Normalize position → CanonicalSlot
    ↓
AdsProvider [wraps app]
    ↓
AdSlot component [THE ONLY RENDERER]
    ↓
Real ads from database OR empty slot
```

## Data Integrity Requirements

**For ads to display now:**

1. `image_url` MUST be:
   - `https://example.com/image.jpg` (external CDN)
   - `http://example.com/image.jpg` (HTTP)
   - `/uploads/image.jpg` (absolute path)
   - **NOT**: `https://via.placeholder.com/728x90?text=...`

2. `position` MUST match ONE of:
   - `top-page-leaderboard`
   - `homepage-leaderboard`
   - `sidebar-ads`
   - `in-content-native-ad`
   - `bottom-leaderboard`
   - `footer-leaderboard`

3. `is_active` MUST be `true`
4. `status` MUST be `'Active'` (text field)

## What Happens Now

**If Database Has Valid Ads:**
- ✓ Ads display from database
- ✓ Click tracking works
- ✓ Impression tracking works
- ✓ No fallback images

**If Database Has Invalid Ads (placeholder URLs):**
- ✗ Ads rejected silently
- ✗ Slots appear empty
- ✗ No fallback images shown
- → Signals data integrity issue

**If Database Has No Ads:**
- ✗ Slots render as null/empty
- ✗ No fallback images shown
- → Expected behavior

## Next Steps

### Critical: Clean the Database

Update any ad rows with placeholder URLs:

```sql
UPDATE ad_slots
SET image_url = '[REAL CDN URL HERE]'
WHERE image_url LIKE '%via.placeholder%' 
   OR image_url LIKE '%?text=%'
```

Replace `[REAL CDN URL HERE]` with:
- Supabase Storage URL
- CDN URL
- Or `/uploads/filename.jpg`

### Verification

After database cleanup:
1. Check `/api/v1/ads` to verify ads are fetched
2. Inspect network tab - no `via.placeholder.com` URLs
3. Check local `/ads` directory - no fallback images should appear
4. Real ads should display in all slots

## Build Status

✓ Compiled successfully
✓ No TypeScript errors
✓ All routes verified
✓ Ready for production deployment (after database cleanup)

---

**System is now data-driven, not fallback-first.**
Real ads display when available, empty slots when not.
No more placeholder images masquerading as real ads.
