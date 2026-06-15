# Ad Campaign Upload Workflow Analysis

## 📋 Overview

The ad system consists of three interconnected layers:
1. **Admin UI** - Campaign management interface
2. **API Layer** - Endpoints for CRUD operations and image handling
3. **Database** - Campaign data, placements, and analytics
4. **Resolution Engine** - Real-time ad selection and serving

---

## 🔄 Upload & Campaign Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN CAMPAIGN MANAGER                      │
│           (components/admin/ad-campaign-manager.tsx)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Campaign Form Inputs:                                          │
│  • Title, Description                                           │
│  • Advertiser Name, URL                                         │
│  • Image URL (MANUAL TEXT INPUT - NO UPLOAD UI)                 │
│  • Start/End Dates                                              │
│  • Slot Selection (Grouped: Homepage, Articles, Mobile)         │
│  • Is Active Toggle                                             │
│                                                                   │
│  On Submit → POST/PUT /api/admin/ad-campaigns                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌─────────────────────┐      ┌──────────────────────┐
    │    IMAGE UPLOAD     │      │  API ENDPOINT        │
    │   (NOT INTEGRATED)  │      │  POST/PUT Routes     │
    │                     │      │                      │
    │ ImageUpload         │      │ • Validate dates     │
    │ Component           │      │ • Validate slots     │
    │ (unused in          │      │ • Insert campaign    │
    │  AdCampaignManager) │      │ • Create placements  │
    │                     │      │ • Invalidate cache   │
    │ • Bucket: 'ads'     │      │                      │
    │ • Size: 2MB max     │      │ Creates:             │
    │ • Formats:          │      │ • ad_campaigns row   │
    │   PNG, JPEG, GIF    │      │ • ad_placements rows │
    │                     │      │                      │
    │ Target:             │      │ Returns: campaign    │
    │ Supabase 'uploads'  │      │ object + cache clear │
    │ bucket              │      │                      │
    └─────────────────────┘      └──────────────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────┐
                            │    DATABASE              │
                            │    (PostgreSQL/Supabase) │
                            │                          │
                            │ Tables Created:          │
                            │ • ad_campaigns           │
                            │ • ad_placements          │
                            │ • ad_impressions         │
                            │ • ad_clicks              │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  RESOLUTION ENGINE       │
                            │  (lib/ads/resolver.ts)   │
                            │                          │
                            │ • Cache (45s TTL)        │
                            │ • Fetch candidates       │
                            │ • Filter: active, dates  │
                            │ • Priority sort + weight │
                            │ • Serve to frontend      │
                            └──────────────────────────┘
```

---

## 📁 File Structure & Responsibilities

### Frontend Components
```
components/
├── image-upload.tsx                    # Reusable upload UI (NOT used by campaigns)
│   ├── Bucket types: ads|articles|magazines
│   ├── Direct Supabase upload (client-side)
│   ├── Path: {bucket}/{timestamp}-{random}-{name}
│   ├── Target storage: 'uploads' bucket
│   └── ⚠️  Bug: References undefined ALLOWED_AD_FORMATS constant
│
└── admin/
    └── ad-campaign-manager.tsx         # Campaign CRUD interface
        ├── Fetches campaigns via GET /api/admin/ad-campaigns
        ├── Creates/updates via POST/PUT /api/admin/ad-campaigns
        ├── Deletes via DELETE /api/admin/ad-campaigns/{id}
        ├── Slot selection (3 groups: Homepage, Articles, Mobile)
        └── ⚠️  Issue: Manual image URL input (no upload widget integrated)
```

### API Endpoints
```
app/api/
├── admin/
│   ├── ad-campaigns/
│   │   ├── route.ts
│   │   │   ├── GET    → List all campaigns with placements
│   │   │   ├── POST   → Create campaign + placements
│   │   │   └── Date & slot validation
│   │   │
│   │   └── [id]/
│   │       └── route.ts
│   │           ├── PUT    → Update campaign + reassign placements
│   │           ├── DELETE → Delete campaign (cascade)
│   │           └── Cache invalidation on mutations
│   │
│   ├── ad-slots/
│   │   └── route.ts
│   │       └── GET    → Slot statistics (impressions, active campaigns)
│   │
│   └── files/upload/
│       └── route.ts
│           ├── POST   → Server-side file upload (FormData)
│           ├── Auth   → Requires admin session
│           ├── Target storage: 'farm-livestock-media' bucket
│           └── ⚠️  Issue: Not called by AdCampaignManager
│
├── ads/
│   ├── [position]/route.ts             # Legacy: GET ads by position
│   ├── click/route.ts                  # POST click event
│   ├── impression/route.ts             # POST impression event
│   └── slots/[slug]/route.ts           # Slot metadata endpoint
```

### Core Libraries
```
lib/
├── ads/
│   ├── constants.ts                    # AD_SLOTS registry, SLOT_CONFIG
│   ├── resolver.ts                     # Ad selection engine (45s cache)
│   ├── utils.ts                        # Helpers: weights, dates, dedup
│   └── seed.ts                         # Sample campaign data
│
├── types/ads.ts                        # TypeScript definitions
├── ads.ts                              # Legacy: getAdsForPosition()
│
└── migrations/
    └── 001-ad-system.sql               # Schema + RLS policies
```

---

## 🗄️ Database Schema

### ad_campaigns
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `title` | TEXT | Campaign name |
| `description` | TEXT | Optional details |
| `advertiser_name` | TEXT | Required |
| `advertiser_url` | TEXT | Click destination |
| `image_url` | TEXT | **REQUIRED for display** |
| `image_path` | TEXT | ⚠️ **UNUSED - legacy field** |
| `start_date` | TIMESTAMP | Campaign start |
| `end_date` | TIMESTAMP | Campaign end |
| `is_active` | BOOLEAN | Enable/disable |
| `created_by` | UUID | Admin reference |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |

### ad_placements
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `campaign_id` | UUID | FK → ad_campaigns |
| `slot_slug` | TEXT | FK → ad_slots (validates against AD_SLOTS constant) |
| `weight` | INTEGER | For random selection (normalized to min 1) |
| `priority` | INTEGER | Selection precedence |
| `is_active` | BOOLEAN | Per-placement control |
| `created_at` | TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | Last update |
| **Constraint** | UNIQUE(campaign_id, slot_slug) | One placement per campaign-slot pair |

### ad_impressions / ad_clicks
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `campaign_id` | UUID | FK → ad_campaigns |
| `slot_slug` | TEXT | FK → ad_slots |
| `user_ip` | TEXT | Optional tracking |
| `user_agent` | TEXT | Browser info |
| `created_at` | TIMESTAMP | Event time |

### Row Level Security (RLS) Policies
```sql
ad_campaigns:
  • Admin can do ALL operations
  • Public can SELECT if: is_active=true AND start_date<=NOW() AND end_date>=NOW()

ad_placements:
  • Admin can do ALL
  • Public can SELECT if: is_active=true

ad_impressions/ad_clicks:
  • Public can INSERT (tracking from frontend)
```

---

## 🎯 Ad Slot Registry

### Slot Types (18 total)

**Global (1 slot)**
- `TOP_HEADER_AD` - 728×90 (header banner)

**Homepage (7 slots)**
- `HOME_LEADERBOARD_PRIMARY` - 1536×190 (rotating)
- `HOME_LEADERBOARD_SECONDARY` - 1536×190 (rotating)
- `LEFT_SIDEBAR` - 300×600 (rotating)
- `RIGHT_SIDEBAR` - 300×600 (rotating)
- `IN_CONTENT_NATIVE` - 728×90 (rotating)
- `BOTTOM_LEADERBOARD` - 728×90
- `BOTTOM_ROTATOR` - 1536×190 (rotating)

**Article Pages (3 slots)**
- `ARTICLE_TOP` - 728×90 (rotating)
- `ARTICLE_MIDDLE` - 728×90 (rotating)
- `ARTICLE_BOTTOM` - 728×90 (rotating)

**Mobile (3 slots)**
- `MOBILE_HEADER` - 320×100
- `MOBILE_STICKY` - 320×50 (sticky footer)
- `MOBILE_INLINE` - 300×250

### Slot Selection UI
Campaign manager groups slots by scope for easier selection:
- Homepage (7 slots with individual toggle + group select)
- Article Pages (3 slots)
- Mobile (3 slots)

---

## ⚙️ Ad Resolution Algorithm

**Selection Rules** (deterministic, no ambiguity):
1. Filter: `placement.is_active = true`
2. Filter: `campaign.is_active = true` AND start_date ≤ now AND (end_date IS NULL OR end_date ≥ now)
3. Filter: `campaign.image_url IS NOT NULL` (never serve broken creatives)
4. Sort by: `campaign.priority` DESC (highest priority wins)
5. If priority tie: weighted random using `placement.weight` (default: 1)

**Performance Optimizations:**
- In-memory cache per slot (45s TTL)
- Cache only stores candidate list; random selection happens per-request
- Cache invalidated on campaign/placement mutations via `invalidateAdCache()`
- Indexes on: `is_active`, `start_date`, `end_date`, campaign_id, slot_slug

---

## 🔴 Redundancies & Issues Found

### 1. **Image Upload - Disconnected**
**Problem**: Ad campaign form has no image upload UI; requires manual URL entry
```typescript
// In AdCampaignManager:
<input type="url" placeholder="Image URL" ... />  // ❌ No upload widget

// ImageUpload component exists but is unused:
<ImageUpload bucket="ads" onChange={...} />  // ✅ Available but not integrated
```
**Impact**: Requires admin to host images elsewhere before adding campaigns
**Fix**: Integrate ImageUpload component into AdCampaignManager form

---

### 2. **Duplicate Upload Paths**
**Problem**: Two separate upload systems in the codebase
```
Path A: components/image-upload.tsx
  → Direct client-side upload
  → Supabase 'uploads' bucket
  → No server auth check

Path B: app/api/admin/files/upload/route.ts
  → Server-side FormData handling
  → Supabase 'farm-livestock-media' bucket
  → Requires admin session validation
```
**Impact**: Confusion about which to use; one is unused by campaigns
**Fix**: Consolidate to single bucket; choose client or server upload

---

### 3. **Missing Constant - Bug**
**Problem**: Code references undefined `ALLOWED_AD_FORMATS`
```typescript
// Line 45 of image-upload.tsx:
if (!ALLOWED_AD_FORMATS.mimeTypes.includes(file.type)) {  // ❌ ReferenceError
  return `Invalid file type. Allowed formats: ${ALLOWED_AD_FORMATS.display}`
}
```
**Impact**: Ad image uploads will crash at runtime
**Fix**: Define constant in image-upload.tsx or lib/:
```typescript
const ALLOWED_AD_FORMATS = {
  mimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
  display: 'PNG, JPEG, GIF'
}
```

---

### 4. **Duplicate Validation Logic**
**Problem**: Date and slot validation repeated in POST and PUT endpoints
```typescript
// POST route (lines 58-78):
const startDate = body.start_date ? new Date(body.start_date) : new Date()
if (isNaN(startDate.getTime())) {
  return NextResponse.json({ error: 'Invalid start_date' }, { status: 400 })
}
// ... repeated in PUT route (lines 14-23)

// Slot validation also duplicated
const invalidSlots = slots.filter(s => !validateSlotSlug(s))
// ... same logic in both routes
```
**Impact**: Inconsistent validation; bugs in one place don't get fixed everywhere
**Fix**: Extract to `lib/ads/validation.ts`:
```typescript
export function validateDateRange(start: unknown, end: unknown): { valid: boolean; error?: string }
export function validateSlots(slots: unknown): { valid: boolean; invalid?: string[] }
```

---

### 5. **Duplicate Placement Creation Logic**
**Problem**: Placement array construction identical in POST and PUT
```typescript
// POST route (lines 105-116):
const placements = slots.map(slot => ({
  campaign_id: campaign.id,
  slot_slug: slot,
  weight: typeof body.weight === 'number' && body.weight > 0 ? body.weight : 1,
  is_active: true,
}))

// PUT route (lines 56-70):
const placements = body.slots.map((slot: string) => ({
  campaign_id: id,
  slot_slug: slot,
  weight: typeof body.weight === 'number' && body.weight > 0 ? body.weight : 1,
  is_active: true,
}))
```
**Impact**: Maintenance burden; weight logic scattered
**Fix**: Extract to helper function

---

### 6. **Unused `image_path` Field**
**Problem**: Database schema includes `image_path` but it's never populated
```sql
CREATE TABLE ad_campaigns (
  ...
  image_url TEXT NOT NULL,
  image_path TEXT,  -- ⚠️ NEVER USED
  ...
)
```
**Impact**: Misleading schema; confuses developers
**Fix**: Document as legacy or remove; only use `image_url`

---

### 7. **Legacy vs New Ad System Conflict**
**Problem**: Two ad systems coexist - position-based and slot-based
```
Old System (lib/ads.ts):
  → getAdsForPosition(position)  // Queries ad_slots table with position
  → Used by: app/api/ads/[position]/route.ts

New System (lib/ads/resolver.ts):
  → resolveAdForSlot(slotSlug)   // Queries ad_campaigns + ad_placements
  → Used by: Frontend ad components
```
**Impact**: Unclear which to use; `/api/ads/[position]` endpoint may be obsolete
**Fix**: Verify if legacy endpoint is still used; migrate or deprecate

---

### 8. **No Weight Default in UI**
**Problem**: Campaign form doesn't show weight control; defaults to 1 server-side
```typescript
// Form only has: title, description, advertiser, dates, slots, active toggle
// No weight field exposed

// Server-side default (POST route, line 114):
weight: typeof body.weight === 'number' && body.weight > 0 ? body.weight : 1,
```
**Impact**: Weight always 1; no way for admins to adjust slot rotation ratios
**Fix**: Add optional weight field to campaign form

---

## 📊 Current Upload Flow (Actual)

```
Admin fills campaign form
  ↓
Manual image URL entry
  ↓
POST /api/admin/ad-campaigns
  ├─ Validate: title, advertiser_name, image_url (not null)
  ├─ Validate: dates (start < end)
  ├─ Validate: slots exist
  ├─ Create ad_campaigns row
  ├─ Create ad_placements rows (weight=1, is_active=true)
  ├─ Call invalidateAdCache()
  └─ Return campaign object
```

---

## 🎯 Ideal Upload Flow (After Fixes)

```
Admin fills campaign form
  ↓
Click "Upload Image" button
  ├─ ImageUpload widget opens
  ├─ Drag or select file
  ├─ Validate: PNG|JPEG|GIF, ≤2MB
  ├─ Upload to Supabase 'uploads' bucket
  └─ URL callback: form.image_url = publicUrl
  ↓
Form autofills with image preview + URL
  ↓
Select slots (with weight override option)
  ↓
POST /api/admin/ad-campaigns with validated data
  ├─ Centralized validation (date + slot)
  ├─ Create campaign + placements
  ├─ Cache invalidation
  └─ Success → Campaign appears on site
```

---

## ✅ Testing Checklist

- [ ] Image upload button works in AdCampaignManager
- [ ] ALLOWED_AD_FORMATS constant defined and imported
- [ ] Campaign creation sends correct payload to API
- [ ] Placements created for each selected slot
- [ ] Cache invalidation triggers on creation/update/delete
- [ ] Ad appears in correct slots after campaign created
- [ ] Weighted rotation works (multiple campaigns in same slot)
- [ ] Date filtering prevents early/expired ad display
- [ ] Admin can update campaign and reassign slots
- [ ] Deleting campaign cascades to placements
- [ ] Legacy `[position]` endpoint still functional (if needed)

---

## 🔗 Related Documentation

- [AD_SYSTEM_ALIGNMENT_COMPLETE.md](AD_SYSTEM_ALIGNMENT_COMPLETE.md) - Previous alignment work
- [AD_ENGINE_V2_COMPLETE.md](AD_ENGINE_V2_COMPLETE.md) - v2 engine docs
- Database migration: [001-ad-system.sql](lib/migrations/001-ad-system.sql)
- Slot constants: [lib/ads/constants.ts](lib/ads/constants.ts)
- Resolution engine: [lib/ads/resolver.ts](lib/ads/resolver.ts)
