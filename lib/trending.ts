import { createClient } from '@/lib/supabase/server'

export interface TrendingArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  author: string
  published_at: string
  category: string
}

/**
 * Fetch trending articles for the homepage.
 *
 * Logic:
 *   select *
 *   from articles
 *   where date_trunc('week', created_at) = date_trunc('week', now())
 *   order by created_at desc
 *   limit 3
 *
 * Fallback:
 *   If no articles exist for the current week, return the 3 most recent articles overall.
 *
 * No engagement tracking, no view counting, no manual selection.
 * Automatically rotates every week based purely on created_at.
 */
export async function getTrendingArticles(): Promise<TrendingArticle[]> {
  const supabase = await createClient()

  try {
    // Primary: current week's articles, newest first
    const { data: currentWeek } = await supabase
      .from('articles')
      .select('*')
      .filter('created_at', 'gte', dateTruncWeek(new Date()))
      .order('created_at', { ascending: false })
      .limit(3)

    if (currentWeek && currentWeek.length >= 3) {
      return mapArticles(currentWeek)
    }

    // Fallback: not enough articles this week → get latest 3 overall
    const { data: allRecent } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    return mapArticles(allRecent || [])
  } catch (error) {
    console.error('Error fetching trending articles:', error)
    return []
  }
}

/**
 * Return an ISO string representing the start of the current week (Monday 00:00 UTC).
 * This lets us filter articles created on or after that point.
 */
function dateTruncWeek(now: Date): string {
  const d = new Date(now)
  const day = d.getDay() // 0=Sun, 1=Mon …
  const diff = day === 0 ? 6 : day - 1 // days since Monday
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function mapArticles(data: any[]): TrendingArticle[] {
  return data.map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? null,
    featured_image_url: a.featured_image_url ?? null,
    author: a.author,
    published_at: a.published_at,
    category: a.category,
  }))
}