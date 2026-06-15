import { NextRequest, NextResponse } from 'next/server'
import { getAdsForPosition } from '@/lib/ads'

export const runtime = 'nodejs'

/**
 * GET /api/ads/[position]
 * 
 * Fetch ads for a specific position
 * 
 * Valid positions: top, homepage, sidebar, in-content, bottom, footer
 * 
 * Response: { position: string, ads: Ad[], count: number }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { position: string } }
) {
  try {
    const { position } = params

    // Validate position
    const validPositions = ['top', 'homepage', 'sidebar', 'in-content', 'bottom', 'footer']
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        {
          error: `Invalid position. Valid values: ${validPositions.join(', ')}`,
          position,
          ads: [],
          count: 0
        },
        { status: 400 }
      )
    }

    // Fetch ads
    const ads = await getAdsForPosition(position)

    return NextResponse.json({
      position,
      ads,
      count: ads.length
    })
  } catch (error) {
    console.error('[api/ads] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        position: params.position,
        ads: [],
        count: 0
      },
      { status: 500 }
    )
  }
}
