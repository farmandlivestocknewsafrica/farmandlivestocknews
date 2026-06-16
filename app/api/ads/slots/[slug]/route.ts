import { NextRequest, NextResponse } from 'next/server'
import { validateSlotSlug, SLOT_CONFIG } from '@/lib/ads/constants'
import { resolveAd } from '@/lib/ads/resolver'

/**
 * GET /api/ads/slots/[slug]
 *
 * Serves one resolved ad for the slot via the cached resolver engine.
 * Impressions are NOT tracked here — they are tracked via
 * POST /api/ads/impression when the ad actually enters the viewport.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log(`[AdAPI] GET /api/ads/slots/${slug}`)

    if (!validateSlotSlug(slug)) {
      console.error(`[v0] Invalid ad slot requested: "${slug}"`)
      return NextResponse.json({ ad: null, error: 'Invalid slot' }, { status: 400 })
    }

    const ad = await resolveAd(slug)

    // Use shorter cache for rotating slots to allow proper rotation
    const config = SLOT_CONFIG[slug]
    const cacheControl = config?.rotating 
      ? 'public, max-age=5, stale-while-revalidate=5' 
      : 'public, max-age=30, stale-while-revalidate=30'

    return NextResponse.json(
      { ad },
      {
        status: 200,
        headers: {
          'Cache-Control': cacheControl,
        },
      }
    )
  } catch (err) {
    console.error('[v0] Error in ad slot API:', err)
    return NextResponse.json({ ad: null }, { status: 200 })
  }
}
