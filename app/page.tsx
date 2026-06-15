import { Header } from '@/components/header'
import { TopBar } from '@/components/top-bar'
import { Footer } from '@/components/footer'
import { HomePageClient } from '@/components/home-page-client'
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

  // Split articles into chunks for mobile ad insertion (every 4 articles)
  const articleChunks: typeof articles[] = []
  const displayArticles = articles.slice(featured ? 1 : 0)
  for (let i = 0; i < displayArticles.length; i += 4) {
    articleChunks.push(displayArticles.slice(i, i + 4))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />

      {/* MOBILE HEADER AD - small screens only */}
      <div className="md:hidden w-full py-2 flex justify-center px-2 bg-muted/20">
        <AdSlot slug="MOBILE_HEADER" width={320} height={50} />
      </div>

      <main className="flex-1">
        {/* HOME TOP ROTATING LEADERBOARD (2A) - below navigation */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="HOME_TOP_ROTATING_1" />
        </div>

        {/* HOME TOP ROTATING LEADERBOARD (2B) - optional second rotating banner */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="HOME_TOP_ROTATING_2" />
        </div>

        <HomePageClient featured={featured} articles={displayArticles} trending={trending} articleChunks={articleChunks} />

        {/* IN-CONTENT NATIVE BANNER (4) - between article sections */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="IN_CONTENT_NATIVE" />
        </div>

        {/* BOTTOM LEADERBOARD BANNER (5) */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="BOTTOM_LEADERBOARD" />
        </div>

        {/* BOTTOM HOME ROTATING LEADERBOARD (6) - rotating banner at page end */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="BOTTOM_HOME_ROTATING" />
        </div>

        {/* MOBILE STICKY AD - small screens only, sticky at bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 w-full py-2 flex justify-center px-2 bg-background border-t border-border z-40">
          <AdSlot slug="MOBILE_STICKY" width={320} height={50} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
