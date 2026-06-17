import { NextResponse } from 'next/server'
import { getTrendingArticles } from '@/lib/trending'

/**
 * GET /api/trending
 *
 * Returns the top 3 trending articles based on current week's created_at.
 * Falls back to latest 3 overall if current week has fewer than 3 articles.
 *
 * Response:
 * ```json
 * {
 *   "trending": [
 *     {
 *       "id": "uuid",
 *       "title": "Article Title",
 *       "slug": "article-slug",
 *       "excerpt": "Article excerpt...",
 *       "featured_image_url": "https://...",
 *       "author": "Author Name",
 *       "published_at": "2024-01-15T00:00:00Z",
 *       "category": "Agribusiness"
 *     }
 *   ]
 * }
 * ```
 */
export async function GET() {
  try {
    const trending = await getTrendingArticles()

    return NextResponse.json({ trending })
  } catch (error) {
    console.error('Error in /api/trending:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending articles', trending: [] },
      { status: 500 }
    )
  }
}
