# Ad Engine - Postmortem & Rebuild Plan

## POSTMORTEM: Why This Failed

### What Went Wrong

1. **Philosophical Conflict**
   - Started as "pure database projection" (zero filtering)
   - Evolved into "validated serving system" (strict filtering)
   - Never chose one, implemented both half-way

2. **Premature Optimization**
   - Built normalization layer before understanding requirements
   - Created canonical enum system that wasn't used
   - Added tracking before core serving worked

3. **Scope Explosion**
   - Started: Display ads on pages
   - Grew to: Admin CRUD, tracking, compliance, multiple APIs
   - Result: 900 lines of code for something that should be ~200 lines

4. **Code Bloat**
   - Dead files: `inject-ads.ts`, `AD_SYSTEM_COMPLIANCE.ts`
   - Duplicate types across 4 different files
   - Multiple API versions with similar logic
   - Unused utility functions

5. **Architecture Drift**
   - Frontend component disabled but infrastructure stays
   - Context provider removed but library code remains
   - API still functional but unreachable
   - Admin UI disconnected from serving

6. **No Clear Data Model**
   - Unclear: Should position be string or enum?
   - Unclear: Should we validate or project?
   - Unclear: Should we track or just display?
   - Result: Every implementation chose differently

### Why It Broke

**Trigger**: User wanted ads disabled temporarily  
**Problem**: Attempted manual removal → sed scripts broke files  
**Real Issue**: System so fragmented that removal broke page rendering  
**Root Cause**: Tight coupling across too many files

### What We Learned

1. ✗ Don't fight your architecture - choose one and commit
2. ✗ Don't add features before core works
3. ✗ Don't create infrastructure for "future flexibility"
4. ✗ Don't keep dead code "just in case"
5. ✗ Don't have conflicting design philosophies in comments

---

## THE REBUILD PLAN

### Design Principles for v2

**Choose: Simple, Direct, Stateless**

1. **Single Data Flow**
   - Database → Server → Component
   - No transformation, normalization, or validation (keep it simple)

2. **No Context Overhead**
   - Pass ads as props through React tree
   - No context provider complexity

3. **Minimal Type System**
   - Use single Ad interface
   - No enum normalization
   - Raw database positions OK (they're just strings)

4. **Single API Endpoint**
   - `/api/ads/[position]` - GET ads for specific position
   - That's it. No admin endpoint in v2. Separate completely.

5. **Component Rendering**
   - `<Ad ad={ad} />` - Render single ad
   - `<AdSlot position="..." />` - Fetch and render

6. **No Tracking v1**
   - Tracking adds 30% of code but no business value yet
   - Add in v2 if needed

---

## REMOVAL & REBUILD STEPS

### Phase 1: Complete Cleanup (Remove Everything)

**Delete** (all ad-related files):
1. `/lib/server-ads.ts`
2. `/lib/canonical-ad-slots.ts`
3. `/lib/ads-context.tsx`
4. `/lib/ad-placements.ts`
5. `/lib/ad-slot-types.ts`
6. `/lib/inject-ads.ts`
7. `/lib/AD_SYSTEM_COMPLIANCE.ts`
8. `/components/ad-slot.tsx`
9. `/app/api/v1/ad-slots/` (entire directory)
10. `/app/api/v1/admin/` (if only ads)
11. `/app/api/ads/` (old endpoints)
12. `/app/admin/ads/` (admin UI - v2 feature)
13. All ad-related documentation files

**Remove** (from other files):
- AdSlot imports and usage (all pages)
- AdsProvider wrapper (layout)
- Ad-related environment variables from .env
- Ad-related database migrations (keep table, clean up schema)

---

### Phase 2: Build v2 From Scratch

**New File Structure** (3 files, ~250 lines total):

#### 1. `/lib/ads.ts` - Core logic (50 lines)
```typescript
interface Ad {
  id: string
  position: string
  image_url: string
  destination_url: string
  title: string
  width: number
  height: number
}

export async function getAdsForPosition(position: string): Promise<Ad[]> {
  // Single function: fetch ads for position
  // No filtering - return what DB has
  // No transformation
}
```

#### 2. `/app/api/ads/[position]/route.ts` - API (30 lines)
```typescript
export async function GET(request: NextRequest, { params }: { params: { position: string } }) {
  // Single endpoint
  // Validate position is one of: 'top', 'homepage', 'sidebar', 'in-content', 'bottom', 'footer'
  // Call getAdsForPosition()
  // Return JSON: { position, ads: [] }
}
```

#### 3. `/components/ad-slot.tsx` - Component (30 lines)
```typescript
interface AdSlotProps {
  position: 'top' | 'homepage' | 'sidebar' | 'in-content' | 'bottom' | 'footer'
}

export function AdSlot({ position }: AdSlotProps) {
  const [ads, setAds] = useState<Ad[]>([])
  
  useEffect(() => {
    fetch(`/api/ads/${position}`).then(r => r.json()).then(d => setAds(d.ads))
  }, [position])
  
  return ads.map(ad => (
    <a key={ad.id} href={ad.destination_url} target="_blank">
      <img src={ad.image_url} alt={ad.title} width={ad.width} height={ad.height} />
    </a>
  ))
}
```

---

### Phase 3: Simplify Database

**Current schema** (20 columns) → **Needed columns** (8 columns):
- Keep: id, position, image_url, destination_url, title, width, height, is_active
- Drop: Everything else (slug, mime_type, file_size, file_path, start/end_date, created_by, etc.)

**Alternative**: Keep schema as-is, just ignore extra columns (simpler)

---

### Phase 4: Integration

**Add to pages** (wherever ads should appear):
```tsx
<AdSlot position="top" />
```

That's it. No context, no provider, no complex setup.

---

## REBUILD IMPLEMENTATION CHECKLIST

- [ ] Delete all files listed in Phase 1
- [ ] Create `/lib/ads.ts` with getAdsForPosition()
- [ ] Create `/app/api/ads/[position]/route.ts` endpoint
- [ ] Create `/components/ad-slot.tsx` component
- [ ] Add AdSlot to homepage
- [ ] Add AdSlot to category pages (in-content)
- [ ] Add AdSlot to article pages
- [ ] Test ad display
- [ ] Build and verify
- [ ] Document in `/lib/ads.md`

---

## ESTIMATED EFFORT

- **Cleanup**: 30 minutes
- **Rebuild**: 1.5 hours
- **Testing**: 30 minutes
- **Documentation**: 15 minutes

**Total**: 2.5 hours

---

## SUCCESS CRITERIA

✓ Ads render on pages (if any exist in DB)  
✓ No broken imports or references  
✓ No console errors  
✓ Clean code ~250 lines (90% reduction)  
✓ Single file for each concern (lib, api, component)  
✓ Simple data flow: DB → API → Component  
✓ No dead code or unused files  
✓ No documentation conflicts  

---

## NEXT STEP

Begin Phase 1: Complete Cleanup

