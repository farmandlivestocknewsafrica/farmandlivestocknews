import { NextRequest, NextResponse } from 'next/server'
import { validateSlotSlug } from '@/lib/ads/constants'
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

    if (!validateSlotSlug(slug)) {
      console.error(`[v0] Invalid ad slot requested: "${slug}"`)
      return NextResponse.json({ ad: null, error: 'Invalid slot' }, { status: 400 })
    }

    const ad = await resolveAd(slug)

    return NextResponse.json(
      { ad },
      {
        status: 200,
        headers: {
          // Short CDN/browser cache aligned with resolver TTL
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=30',
        },
      }
    )
  } catch (err) {
    console.error('[v0] Error in ad slot API:', err)
    return NextResponse.json({ ad: null }, { status: 200 })
  }
}
