import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface ArticlesQuery {
  category?: string
  limit?: number
  cursor?: string
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)
    const cursor = searchParams.get('cursor') // published_at timestamp for cursor

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .limit(limit + 1)

    if (category) {
      const validCategories = [
        'crop_production',
        'livestock_farming',
        'technology_innovation',
        'equipment_mechanisation',
        'nutrition',
        'agribusiness'
      ]
      
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
      
      query = query.eq('category', category)
    }

    // Cursor-based pagination: if cursor provided, fetch articles published before that timestamp
    if (cursor) {
      try {
        query = query.lt('published_at', new Date(cursor).toISOString())
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid cursor format' },
          { status: 400 }
        )
      }
    }

    const { data, error, count } = await query

    if (error) {
      console.error('[v0] Articles fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }

    const hasMore = data && data.length > limit
    const articles = hasMore ? data.slice(0, limit) : data || []

    // nextCursor is the published_at of the last article (for fetching older articles)
    const nextCursor = hasMore && articles.length > 0
      ? articles[articles.length - 1].published_at
      : null

    return NextResponse.json({
      articles,
      nextCursor,
      hasMore,
      total: !cursor ? count : undefined // Only return total on first request
    })
  } catch (error) {
    console.error('[v0] Articles API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
