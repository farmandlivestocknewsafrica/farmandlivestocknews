import { HomePageClient } from '@/components/home-page-client'
import { SiteShell } from '@/components/site-shell'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'
import { getTrendingArticles } from '@/lib/trending'

async function getHomepageData(page: number) {
  const supabase = await createClient()

  const ARTICLES_PER_PAGE = 20
  const from = (page - 1) * ARTICLES_PER_PAGE
  const to = from + ARTICLES_PER_PAGE - 1
  
  try {
    const [featuredRes, articlesRes, trending] = await Promise.all([
      supabase
        .from('articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1),
      supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .order('published_at', { ascending: false })
        .range(from, to),
                                                                   
      getTrendingArticles()
    ])

    return {
      featured: featuredRes.data?.[0] || null,
      articles: articlesRes.data || [],
      totalArticles: articlesRes.count || 0,
      articlesPerPage: ARTICLES_PER_PAGE,
      trending
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      featured: null,
      articles: [],
      trending: []
    }
  }
}

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const page = Number(params.page || '1')
  
  const {
    featured,
    articles,
    trending,
    totalArticles,
    articlesPerPage
  } = await getHomepageData(page)

  return (
    <SiteShell>
      {/* Home Page Leaderboard Primary - below nav, above content */}
      <div className="home-page-leaderboard w-full flex justify-center py-6">
        <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
      </div>

      <div className="w-full flex justify-center py-4">
        <AdPlacement slug="HOME_LEADERBOARD_SECONDARY" variant="leaderboard" />
      </div>

      <HomePageClient
        featured={featured}
        articles={articles}
        trending={trending}
        totalArticles={totalArticles}
        articlesPerPage={articlesPerPage}
        currentPage={page}
      />

      <div className="w-full py-4 flex justify-center">
        <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
      </div>

      <div className="w-full py-4 flex justify-center">
        <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
      </div>

      <MobileInlineAd />
    </SiteShell>
  )
}
