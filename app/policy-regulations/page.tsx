import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { SidebarBanners } from '@/components/sidebar-banners'
import { createClient } from '@/lib/supabase/server'

async function getCategoryData() {
  const supabase = await createClient()
  try {
    const articlesRes = await supabase.from('articles').select('*').eq('category', 'policy').order('published_at', { ascending: false })
    return { category: 'Policy & Regulations', articles: articlesRes.data || [] }
  } catch (error) {
    return { category: 'Policy & Regulations', articles: [] }
  }
}

export default async function PolicyRegulationsPage() {
  const { category, articles } = await getCategoryData()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
        </div>
        <div className="w-full px-4 py-12">
          <div className="max-w-7xl mx-auto mb-12 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-4"><div className="h-1 w-12 bg-primary"></div><span className="text-sm font-semibold text-primary uppercase">Category</span></div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">{category} <span className="text-foreground">NEWS & INSIGHTS</span></h1>
          </div>
          {articles.length > 0 ? (
            <div className="max-w-7xl mx-auto flex gap-10 xl:gap-14 2xl:gap-20 items-start">
              <SidebarBanners side="left" />
              <div className="flex-1 min-w-0">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
                    <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <ArticleCard id={article.id} slug={article.slug} title={article.title} excerpt={article.excerpt} featured_image_url={article.featured_image_url} author={article.author} published_at={article.published_at} category={article.category} variant="list" animationDelay={index} />
                    </div>
                  ))}
                </div>
              </div>
              <SidebarBanners side="right" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto text-center py-12 animate-fade-in-up"><p className="text-muted-foreground">No articles found.</p></div>
          )}
        </div>
        <AdPlacement slug="IN_CONTENT_NATIVE" variant="native" className="px-4" />
        <div className="w-full py-3 flex justify-center px-4"><AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" /></div>
        <div className="w-full py-3 flex justify-center px-4"><AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" /></div>
        <MobileInlineAd />
      </main>
      <Footer />
    </div>
  )
}
