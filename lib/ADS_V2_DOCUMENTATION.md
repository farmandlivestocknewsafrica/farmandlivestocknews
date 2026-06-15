# Ad Engine v2 - Simple, Clean, Direct

**Status**: Fresh rebuild - minimal, focused, maintainable

## Architecture

### Files (3 total, ~210 lines)

1. **`/lib/ads.ts`** (53 lines)
   - `Ad` interface (required fields only)
   - `getAdsForPosition(position: string)` function
   - Direct database query, no transformation

2. **`/app/api/ads/[position]/route.ts`** (57 lines)
   - Single endpoint: `GET /api/ads/[position]`
   - Validates position parameter
   - Returns: `{ position, ads: [], count }`
   - Error handling with fallback empty array

3. **`/components/ad-slot.tsx`** (100 lines)
   - Client-side component
   - Fetches ads on mount using `useEffect`
   - Renders single ad or multiple (sidebar)
   - Handles loading and error states

---

## Valid Positions

```
'top'          - Page top leaderboard (728x90)
'homepage'     - Category/homepage leaderboard (728x90)
'sidebar'      - Right sidebar column (400x800) - renders all ads stacked
'in-content'   - Mid-article/mid-page native ad (468x60)
'bottom'       - Page bottom leaderboard (728x90)
'footer'       - Footer leaderboard (728x90)
```

---

## Usage

### Display ads on a page

```tsx
import { AdSlot } from '@/components/ad-slot'

export default function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      
      {/* Top ad */}
      <div className="my-4">
        <AdSlot position="top" />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-3 gap-8">
        <main className="col-span-2">
          <AdSlot position="in-content" />
          {/* ... article content ... */}
        </main>
        
        {/* Sidebar */}
        <aside>
          <AdSlot position="sidebar" />
        </aside>
      </div>
      
      {/* Bottom ad */}
      <div className="my-4">
        <AdSlot position="bottom" />
      </div>
    </div>
  )
}
```

### Fetch ads programmatically

```tsx
import { getAdsForPosition } from '@/lib/ads'

export default async function MyComponent() {
  const ads = await getAdsForPosition('homepage')
  return <div>{ads.length} ads available</div>
}
```

### API usage

```bash
# Get ads for a position
curl http://localhost:3000/api/ads/top

# Response
{
  "position": "top",
  "ads": [
    {
      "id": "uuid",
      "position": "top",
      "image_url": "https://...",
      "destination_url": "https://...",
      "title": "Ad Title",
      "width": 728,
      "height": 90,
      "is_active": true
    }
  ],
  "count": 1
}
```

---

## Data Flow

```
Database (ad_slots)
    ↓
/lib/ads.ts (getAdsForPosition)
    ↓
/api/ads/[position] (validate + return)
    ↓
<AdSlot position="..." /> (fetch + render)
    ↓
User sees ad in browser
```

---

## How It Works

### 1. Component Initialization

When `<AdSlot position="top" />` mounts:
- `useEffect` runs
- Calls `fetch('/api/ads/top')`

### 2. API Processing

`GET /api/ads/top` route:
- Validates "top" is in allowed positions list
- Calls `getAdsForPosition('top')`
- Returns JSON response

### 3. Database Query

`getAdsForPosition('top')`:
- Connects to Supabase
- Selects from `ad_slots` table
- Filters: `position = 'top' AND is_active = true`
- Orders by: priority DESC, weight DESC
- Returns Ad[] array

### 4. Rendering

Component receives ads and:
- If sidebar: render all ads stacked
- Otherwise: render first ad only
- If no ads: return null (render nothing)

---

## Database Requirements

### Minimum Columns (required)

```sql
id              UUID PRIMARY KEY
position        TEXT (one of: top, homepage, sidebar, in-content, bottom, footer)
image_url       TEXT (required for display)
destination_url TEXT (required for link)
title           TEXT (required for alt text)
width           INTEGER (display width)
height          INTEGER (display height)
is_active       BOOLEAN (filter by true)
```

### Optional Columns (for admin)

```sql
priority        INTEGER (sort order, DESC)
weight          INTEGER (secondary sort, DESC)
created_at      TIMESTAMP (audit)
status          TEXT (Draft, Active, Archived)
```

---

## Important Differences from v1

### ✓ What's Better

1. **90% less code** - 210 lines instead of 920
2. **Single endpoint** - `/api/ads/[position]` only
3. **No transformation** - Position stays as database string
4. **No normalization** - No enum layer, just strings
5. **Clear data flow** - DB → API → Component
6. **No dead code** - Everything is used
7. **No conflicts** - Single philosophy: simple and direct
8. **Easy to debug** - Three files, clear logic

### ✗ What's Not Included Yet

- ~~Impression tracking~~ (add if needed, separate endpoint)
- ~~Click tracking~~ (add if needed, separate endpoint)  
- ~~Admin CRUD interface~~ (separate admin module)
- ~~Database schema migrations~~ (use Supabase dashboard)
- ~~Context provider~~ (props-based instead)
- ~~Normalization system~~ (not needed)

---

## Adding Features Later

### To add impression tracking

```tsx
// When ad becomes visible (IntersectionObserver)
await fetch('/api/ads/track/impression', {
  method: 'POST',
  body: JSON.stringify({ id: ad.id })
})
```

### To add click tracking

```tsx
// On click handler in component
await fetch('/api/ads/track/click', {
  method: 'POST',
  body: JSON.stringify({ id: ad.id })
})
```

### To add admin interface

Create `/app/admin/ads/` with CRUD pages (separate concern).

---

## Troubleshooting

### No ads showing

1. Check: Are there rows in `ad_slots` table with `position` matching what you requested?
2. Check: Are they marked `is_active = true`?
3. Check: Are `image_url` and `destination_url` populated?
4. Check: Browser console for errors
5. Check: Network tab for `/api/ads/...` response

### Component renders null

- This is correct if no ads exist for position
- Check database for matching position with `is_active = true`

### API returns 400

- Invalid position parameter
- Check: Is position in the valid list?
- Valid: 'top', 'homepage', 'sidebar', 'in-content', 'bottom', 'footer'

### API returns 500

- Database connection error
- Check: Supabase credentials in `.env`
- Check: RLS policies allow public read on `ad_slots`
- Check: Server logs for error details

---

## RLS Policies

Required for public read:

```sql
CREATE POLICY "public_read_ads" ON ad_slots
  FOR SELECT USING (is_active = true)
```

---

## Next Steps

1. Add ads to `ad_slots` table
2. Place `<AdSlot position="..." />` on pages
3. Test rendering
4. Add tracking endpoints if needed
5. Create admin interface if needed

