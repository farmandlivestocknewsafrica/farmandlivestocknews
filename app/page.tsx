import { HomePageClient } from '@/components/home-page-client'
import { SiteShell } from '@/components/site-shell'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'

async function getHomepageData() {
  const supabase = await createClient()
  
  try {
    const [featuredRes, articlesRes, trendingRes] = await Promise.all([
      supabase
        .from('articles')
        .select('*')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1),
      supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false }),
      supabase
        .from('trending_news')
        .select('*, articles(*)')
        .order('position', { ascending: true })
        .limit(3)
    ])

    return {
      featured: featuredRes.data?.[0] || null,
      articles: articlesRes.data || [],
      trending: trendingRes.data || []
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

export default async function Home() {
  const { featured, articles, trending } = await getHomepageData()

  return (
    <SiteShell>
      <div className="w-full">
        {/* Home Page Leaderboard Primary - below nav, above content */}
        <div className="home-page-leaderboard w-full flex justify-center py-6 mb-4">
          <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
        </div>

        <div className="w-full flex justify-center py-4 mb-4">
          <AdPlacement slug="HOME_LEADERBOARD_SECONDARY" variant="leaderboard" />
        </div>

        <HomePageClient featured={featured} articles={articles} trending={trending} />

        <div className="w-full py-4 flex justify-center">
          <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
        </div>

        <div className="w-full py-4 flex justify-center">
          <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
        </div>

        <MobileInlineAd />
      </div>
    </SiteShell>
  )
}