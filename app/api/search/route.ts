import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [], suggestions: [] })
  }

  const supabase = await createClient()

  try {
    // 1. Fetch Articles with Ranking
    // We use websearch for basic fuzzy/full-text matching in Supabase if enabled, 
    // or just ilike for simplicity if we don't have tsvector set up.
    // However, the requirement is "high performance" and "fuzzy matching".
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, category, author, published_at, featured_image_url, view_count')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(10)

    if (error) throw error

    // 2. Generate predictive suggestions based on titles
    const suggestions = articles
      ?.map(a => {
        const title = a.title.toLowerCase()
        if (title.includes(query.toLowerCase())) {
          return a.title
        }
        return null
      })
      .filter(Boolean)
      .slice(0, 5) || []

    // 3. Ranking logic (Client side or in-memory for now if DB isn't optimized)
    const rankedArticles = articles?.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const q = query.toLowerCase()

      // Exact title match gets highest priority
      if (aTitle === q) return -1
      if (bTitle === q) return 1

      // Title starts with query
      if (aTitle.startsWith(q) && !bTitle.startsWith(q)) return -1
      if (bTitle.startsWith(q) && !aTitle.startsWith(q)) return 1

      // Recency (last 14 days)
      const now = new Date()
      const fourteenDaysAgo = new Date(now.setDate(now.getDate() - 14))
      const aRecent = new Date(a.published_at) > fourteenDaysAgo
      const bRecent = new Date(b.published_at) > fourteenDaysAgo
      if (aRecent && !bRecent) return -1
      if (bRecent && !aRecent) return 1

      // Popularity
      return (b.view_count || 0) - (a.view_count || 0)
    })

    // 4. Trending searches (Simulated or from a table if we add it)
    // For now, let's return some high-intent agricultural terms
    const trending = [
      'Maize Prices',
      'Cattle Exports',
      'Foot and Mouth Disease',
      'Fertilizer Subsidy'
    ]

    return NextResponse.json({
      results: rankedArticles || [],
      suggestions: suggestions,
      trending: trending
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
