# Ad Engine - Comprehensive Analysis & Postmortem

**Report Date**: June 10, 2026  
**Analysis Scope**: Full codebase, database schema, API endpoints, admin interfaces  
**Total Code**: ~924 lines across 8 files

---

## EXECUTIVE SUMMARY

The ad engine is a **complex, multi-layered system with fundamental architectural conflicts**. It was designed to be a "pure database projection" but contains contradictory filtering, normalization, and tracking logic that create confusion and inconsistency throughout the codebase.

**Status**: BROKEN AND INCOMPLETE
- Ad rendering currently disabled (returns null)
- Contradictory design principles implemented
- Multiple API versions with different logic
- Admin UI incomplete/disconnected
- Database schema oversized for current use case

---

## SYSTEM ARCHITECTURE

### 1. Database Layer (`ad_slots` table)

**Schema** (20 columns):
```
- id (UUID)
- title, slug, position (core fields)
- image_url, destination_url (serving)
- width, height (display dimensions)
- status, is_active (availability flags)
- impression_count, click_count (tracking)
- priority, weight (ordering)
- mime_type, file_size, file_path (file metadata)
- start_date, end_date (campaign window)
- created_by, created_at, updated_at (audit)
```

**RLS Policy**: `ad_slots_public_read` (anyone can SELECT), `ad_slots_admin_all` (staff full access)

**Issue**: Overly complex for display-only content. Many fields (mime_type, file_size, file_path, slug, etc.) unused by frontend.

---

### 2. Core Libraries (~360 lines)

#### `server-ads.ts` (57 lines)
**Purpose**: Fetch ads from database on every page load

**Logic**:
```typescript
- Fetch ALL rows from ad_slots (no filtering)
- Group by raw "position" string
- Return Record<string, any[]>
```

**Issue**: Claims "NO FILTERING, NO VALIDATION" but conflicts with other system parts that DO filter and validate.

#### `canonical-ad-slots.ts` (117 lines)
**Purpose**: Define canonical slot names and normalization

**Components**:
- `CanonicalSlot` enum (6 slots: TOP_LEADERBOARD, HOMEPAGE_LEADERBOARD, SIDEBAR, IN_CONTENT, BOTTOM_LEADERBOARD, FOOTER_LEADERBOARD)
- `SLOT_NORMALIZATION_MAP` (DB position → canonical)
- `CANONICAL_TO_DB_POSITION` (reverse mapping)
- `normalizeAdSlot()`, `normalizeAndGroupAds()` functions

**Issue**: These functions exist but are NOT USED. The actual system uses raw string positions.

#### `ads-context.tsx` (36 lines)
**Purpose**: React context for sharing ads throughout app

**Components**:
- `AdsProvider` (wraps app, provides ads)
- `useResolvedAds()` hook
- Type: `Record<string, any[]>` (raw string keys)

**Issue**: Context is stripped to bare minimum but still exists with no provider in layout.

#### `ad-placements.ts` (40 lines)
**Purpose**: Configuration constants for ad formats

**Contains**:
- `AD_SLOTS_FINAL` (dimensions for each position)
- `ALLOWED_AD_FORMATS` (JPEG, PNG, WebP, GIF only)
- `validateAdDimensions()` function

**Issue**: Used in admin but not in serving layer.

#### `ad-slot-types.ts` (97 lines)
**Purpose**: TypeScript interfaces (duplicates other files)

**Contains**: Ad interfaces, placement types, utility functions

**Issue**: Redundant type definitions across multiple files.

#### `inject-ads.ts` (92 lines)
**Purpose**: Ad injection logic for content

**Note**: Appears to have been abandoned during development.

#### `AD_SYSTEM_COMPLIANCE.ts` (321 lines)
**Purpose**: Compliance/tracking documentation

**Note**: Large documentation file, not active code.

---

### 3. API Layer (~183 lines across 5 endpoints)

#### Serving Endpoints

**`GET /api/v1/ad-slots?position=POSITION_NAME`** (78 lines)
```
- Validates position against strict enum
- Filters: is_active=true AND status='Active'
- Returns: { position, ads: [], count }
- Order by: priority DESC, weight DESC
```
**Issue**: Contradicts "no filtering" philosophy. Actually enforces validation.

**`POST /api/v1/ad-slots/click`** (Click tracking)
```
- Accepts: { id: uuid }
- Returns: { url: destination_url }
- Updates: click_count++
```

**`POST /api/v1/ad-slots/impression`** (Impression tracking)
```
- Accepts: { id: uuid }
- Returns: { success: true }
- Updates: impression_count++
- Fire-and-forget (always returns 200)
```

#### Admin Endpoints

**`GET /api/admin/ads`** (Fetch all ads)
```
- Returns all ads with metrics
- Format: { ads: [...], impression_count, click_count }
```

**`POST /api/admin/ads`** (Create ad)
```
- Fields: title, slug, position, image_url, destination_url, dimensions, dates, etc.
- Validates: title, slug, position required
- Initializes: status='Draft', is_active=false
```

**`[id]` routes** (Update, delete by ID)

---

### 4. Frontend Components (11 lines)

**`components/ad-slot.tsx`**:
```typescript
export function AdSlot() {
  return null
}
```

Currently disabled - returns null unconditionally. Previously would render images/links.

---

### 5. Admin UI (8,646 lines in `/admin/ads/`)

**`/admin/ads/page.tsx`**: List all ads with edit/delete
**`/admin/ads/new/page.tsx`**: Create new ad form
**`/admin/ads/[id]/page.tsx`**: Edit existing ad

**Features**:
- Position selector (dropdown)
- Image URL input
- Destination URL input
- Dimension input (width/height)
- Status dropdown (Draft/Active/Archived)
- Campaign date range
- Impression/click metrics display

**Issue**: Disconnected from serving layer. Editing ads doesn't immediately affect what's displayed because component returns null.

---

## WHAT WORKS

1. ✓ Database schema is normalized and comprehensive
2. ✓ Admin CRUD operations functional
3. ✓ Impression and click tracking APIs working
4. ✓ RLS policies set up correctly
5. ✓ Type definitions complete

---

## WHAT DOESN'T WORK

1. ✗ **Frontend rendering completely disabled** - `AdSlot` returns null
2. ✗ **Contradictory philosophy** - Claims "no filtering" but filters everywhere
3. ✗ **Context not injected** - `AdsProvider` removed from layout
4. ✗ **Normalization unused** - Canonical slot logic exists but isn't used
5. ✗ **Multiple API versions** - `/api/v1/ad-slots` vs `/api/ads` vs `/api/admin/ads` with inconsistent logic
6. ✗ **Dead code** - `inject-ads.ts`, `AD_SYSTEM_COMPLIANCE.ts` not in use
7. ✗ **No page integration** - No AdSlot components placed on any pages
8. ✗ **Unused utilities** - `ad-slot-types.ts` duplicates other definitions
9. ✗ **Documentation confusion** - Multiple readme files with conflicting specs
10. ✗ **Placeholder residue** - Gray ad containers still in some page code

---

## ROOT CAUSE ANALYSIS

### Why It Failed

1. **Scope Creep**: System evolved from simple display to full tracking/admin platform without redesign
2. **Architectural Flip-Flops**: Constantly switched between "pure projection" and "validated filtering"
3. **Incomplete Implementation**: Code pushed for filtering/normalization but serving layer never updated
4. **No Clear Data Flow**: Unclear whether position should be raw string or canonical enum
5. **Debugging at Cost of Design**: Each bug fix added new layer instead of reconsidering architecture
6. **Multiple Decision Makers**: Different authors pushed different philosophies (visible in code comments)

### Why It's Hard to Fix

1. **Fragmented Logic**: Ad rules scattered across server-ads, context, API, admin, components
2. **Type Conflicts**: Different files use different type systems (string vs enum, any vs Ad interface)
3. **Dead Code**: Hard to know what's active vs abandoned without digging
4. **Implicit Contracts**: Frontend expects specific API response format; breaking one breaks others
5. **Testing Gap**: No tests to validate behavior

---

## DETAILED PROBLEMS

### Problem 1: Contradictory Design Principles

**Claims**: "Pure database projection - NO FILTERING, NO VALIDATION"

**Reality**: 
- `server-ads.ts`: Fetches all rows
- `GET /api/v1/ad-slots`: Filters by is_active AND status
- Admin form: Validates required fields
- Placement config: Validates dimensions

**Impact**: Impossible to understand system's actual behavior.

### Problem 2: Orphaned Normalization System

**Code exists** in `canonical-ad-slots.ts`:
- `normalizeAdSlot()` - Convert raw position to canonical enum
- `normalizeAndGroupAds()` - Group by canonical slot
- Complete bi-directional mapping

**But is NEVER called** by serving layer, which uses raw strings.

**Impact**: Type confusion. System uses `Record<string, any[]>` instead of `Record<CanonicalSlot, Ad[]>`.

### Problem 3: Disabled Frontend (Returns Null)

**Current State**: `AdSlot` component returns `null` unconditionally

**Previous Intent**: Render image + link for single ads, stack for sidebar

**Impact**: Even if all other systems working, nothing displays.

### Problem 4: Missing Context Provider

**Code exists**: `AdsProvider` component

**But never injected**: No `<AdsProvider>` in `layout.tsx`

**Impact**: `useResolvedAds()` returns empty object everywhere.

### Problem 5: API Endpoint Proliferation

**Multiple endpoints with different behaviors**:
- `/api/v1/ad-slots` - Validates position, filters by status
- `/api/ads/click` - Old endpoint?
- `/api/admin/ads` - Admin endpoint
- `/api/v1/admin/ad-slots` - Another admin endpoint?

**No clear spec** on which to use when.

**Impact**: Developers confused about correct endpoint.

### Problem 6: Incomplete Admin UI

Admin pages exist but:
- Can create ads without seeing them displayed
- No real-time preview
- No bulk operations
- No performance metrics beyond raw impression/click counts

---

## DATABASE ANALYSIS

### Current Table State

**Columns** (20 total, many unused):
- **Required for serving**: id, position, image_url, destination_url
- **Required for display**: width, height, title
- **Unused**: slug, mime_type, file_size, file_path, start_date, end_date, created_by

### RLS Policies

```
1. ad_slots_public_read: SELECT to all users
2. ad_slots_admin_all: All operations for admin users
3. ad_slots_server_operations: INSERT for server
```

**Issue**: `created_by` field exists but not populated (shows NULL in admin).

---

## RECOMMENDATIONS FOR REBUILD

### To Fix This Properly

1. **Choose one design philosophy** - Either "pure projection" (no filtering) OR "validated serving" (with filtering). Not both.

2. **Consolidate normalization** - Either use canonical enums everywhere OR raw strings everywhere. Not mixed.

3. **Single source of serving logic** - One API endpoint for fetching ads, one source of truth for position validation.

4. **Re-enable frontend** - Restore `AdSlot` component rendering with clear logic.

5. **Inject context** - Add `AdsProvider` back to layout with actual data.

6. **Remove dead code** - Delete `inject-ads.ts`, `AD_SYSTEM_COMPLIANCE.ts`, duplicate type files.

7. **Consolidate APIs** - One `/api/ads` endpoint with clear documentation.

8. **Add tracking** - Integrate click/impression tracking into main component.

9. **Admin improvements** - Real-time preview, status indicators, bulk actions.

10. **Write tests** - Unit tests for normalization, API validation, component rendering.

---

## FILE INVENTORY

### Ad System Files (20 files total)

**Core Libraries** (7 files, 461 lines):
- `/lib/server-ads.ts` - Server fetch logic
- `/lib/canonical-ad-slots.ts` - Normalization system
- `/lib/ads-context.tsx` - React context
- `/lib/ad-placements.ts` - Configuration
- `/lib/ad-slot-types.ts` - Type definitions
- `/lib/inject-ads.ts` - Ad injection (unused)
- `/lib/AD_SYSTEM_COMPLIANCE.ts` - Documentation

**API Endpoints** (9 files, 190 lines):
- `/app/api/v1/ad-slots/route.ts` - Main serving
- `/app/api/v1/ad-slots/click/route.ts` - Click tracking
- `/app/api/v1/ad-slots/impression/route.ts` - Impression tracking
- `/app/api/admin/ads/route.ts` - Admin CRUD
- `/app/api/admin/ads/[id]/route.ts` - Admin single
- `/app/api/ads/click/route.ts` - Old endpoint
- `/app/api/ads/impression/route.ts` - Old endpoint
- `/app/api/v1/admin/ad-slots/route.ts` - Another admin endpoint
- Other legacy endpoints

**Components** (2 files, 11 lines):
- `/components/ad-slot.tsx` - Frontend renderer (disabled)
- Other UI components

**Admin UI** (3 files, 8,646 lines):
- `/app/admin/ads/page.tsx` - List ads
- `/app/admin/ads/new/page.tsx` - Create ad form
- `/app/admin/ads/[id]/page.tsx` - Edit ad

**Documentation** (4 files):
- `AD_ENGINE_COMPREHENSIVE_ANALYSIS.md` (this file)
- `AD_SYSTEM_DISABLED.md`
- `RAW_DATABASE_PROJECTION_FINAL.md`
- `PURE_DATABASE_PROJECTION_SYSTEM.md`

---

## CONCLUSION

The ad engine is **architecturally unsound** with contradictory design principles, orphaned code, and incomplete implementation. A complete rebuild from first principles is recommended rather than attempting piecemeal fixes.

The rebuild should:
1. Choose ONE clear design philosophy
2. Implement ONLY what's needed (remove 70% of code)
3. Start with serving logic first
4. Add admin UI second
5. Add tracking last
6. Write tests as you go

**Estimated effort**: 4-6 hours for complete rebuild from scratch.

