import { NextRequest, NextResponse } from 'next/server'
import { validateSlotSlug, SLOT_CONFIG } from '@/lib/ads/constants'
import { resolveAd, resolveRotationAds } from '@/lib/ads/resolver'

/**
 * GET /api/ads/slots/[slug]
 *
 * ?rotate=1  → { ads: AdForSlot[], rotating: boolean } for in-slot carousel
 * default    → { ad: AdForSlot | null } single weighted pick (legacy)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const rotate = request.nextUrl.searchParams.get('rotate') === '1'

    if (!validateSlotSlug(slug)) {
      return NextResponse.json({ ad: null, ads: [], error: 'Invalid slot' }, { status: 400 })
    }

    const config = SLOT_CONFIG[slug]
    const cacheControl = config?.rotating
      ? 'public, max-age=5, stale-while-revalidate=5'
      : 'public, max-age=30, stale-while-revalidate=30'

    if (rotate) {
      const ads = await resolveRotationAds(slug)
      return NextResponse.json(
        { ads, rotating: config?.rotating ?? false },
        { status: 200, headers: { 'Cache-Control': cacheControl } },
      )
    }

    const ad = await resolveAd(slug)
    return NextResponse.json(
      { ad },
      { status: 200, headers: { 'Cache-Control': cacheControl } },
    )
  } catch (err) {
    console.error('[v0] Error in ad slot API:', err)
    return NextResponse.json({ ad: null, ads: [] }, { status: 200 })
  }
}
