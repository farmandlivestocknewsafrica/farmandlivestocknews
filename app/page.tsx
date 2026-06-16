import { HomePageClient } from '@/components/home-page-client'
import { SiteShell } from '@/components/site-shell'
import { AdSlot } from '@/components/ad-slot'
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
        {/* Home Page Leaderboard - below nav, above content */}
        <div className="home-page-leaderboard w-full flex justify-center py-6 mb-4">
          <AdSlot slug="HOME_LEADERBOARD_PRIMARY" />
        </div>

        {/* Content stream */}
        <HomePageClient featured={featured} articles={articles} trending={trending} />

        {/* Bottom Leaderboard - before footer */}
        <div className="w-full py-4 flex justify-center">
          <AdSlot slug="BOTTOM_LEADERBOARD" />
        </div>
      </div>

      {/* MOBILE STICKY AD */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full py-2 flex justify-center px-2 bg-background border-t border-border z-40">
        <AdSlot slug="MOBILE_STICKY" width={320} height={50} />
      </div>
    </SiteShell>
  )
}