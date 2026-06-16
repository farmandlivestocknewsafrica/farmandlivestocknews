import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdSlot } from '@/components/ad-slot'
import { createClient } from '@/lib/supabase/server'

async function getCategoryData() {
  const supabase = await createClient()
  try {
    const articlesRes = await supabase.from('articles').select('*').eq('category', 'nutrition').order('published_at', { ascending: false })
    return { category: 'Inputs & Nutrition', articles: articlesRes.data || [] }
  } catch (error) {
    return { category: 'Inputs & Nutrition', articles: [] }
  }
}

export default async function InputsPage() {
  const { category, articles } = await getCategoryData()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdSlot slug="HOME_LEADERBOARD_PRIMARY" />
        </div>
        <div className="w-full px-4 py-12">
          <div className="max-w-7xl mx-auto mb-12 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-4"><div className="h-1 w-12 bg-primary"></div><span className="text-sm font-semibold text-primary uppercase">Category</span></div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">{category} <span className="text-foreground">NEWS & INSIGHTS</span></h1>
          </div>
          {articles.length > 0 ? (
            <div className="max-w-7xl mx-auto flex gap-6 relative">
              <aside className="hidden xl:block w-[160px] 2xl:w-[300px] flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  <AdSlot slug="LEFT_SIDE_BANNER_1" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_2" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_3" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_4" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_5" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_6" width={160} height={600} />
                  <AdSlot slug="LEFT_SIDE_BANNER_7" width={160} height={600} />
                </div>
              </aside>
              <div className="flex-1 min-w-0">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
                    <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <ArticleCard id={article.id} slug={article.slug} title={article.title} excerpt={article.excerpt} featured_image_url={article.featured_image_url} author={article.author} published_at={article.published_at} category={article.category} variant="list" animationDelay={index} />
                    </div>
                  ))}
                </div>
              </div>
              <aside className="hidden xl:block w-[160px] 2xl:w-[300px] flex-shrink-0">
                <div className="sticky top-24 space-y-4">
                  <AdSlot slug="RIGHT_SIDE_BANNER_1" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_2" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_3" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_4" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_5" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_6" width={160} height={600} />
                  <AdSlot slug="RIGHT_SIDE_BANNER_7" width={160} height={600} />
                </div>
              </aside>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto text-center py-12 animate-fade-in-up"><p className="text-muted-foreground">No articles found.</p></div>
          )}
        </div>
        <div className="w-full py-3 flex justify-center px-4"><AdSlot slug="IN_CONTENT_NATIVE" /></div>
        <div className="w-full py-3 flex justify-center px-4"><AdSlot slug="BOTTOM_LEADERBOARD" /></div>
        <div className="w-full py-3 flex justify-center px-4"><AdSlot slug="BOTTOM_ROTATOR" /></div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 w-full py-2 flex justify-center px-2 bg-background border-t border-border z-40"><AdSlot slug="MOBILE_STICKY" width={320} height={50} /></div>
      </main>
      <Footer />
    </div>
  )
}
