import { SiteShell } from '@/components/site-shell'
import { ArticleCard } from '@/components/article-card'
import { AdSlot } from '@/components/ad-slot'
import { createClient } from '@/lib/supabase/server'

async function getCategoryData() {
  const supabase = await createClient()
  
  try {
    const articlesRes = await supabase
      .from('articles')
      .select('*')
      .eq('category', 'livestock_farming')
      .order('published_at', { ascending: false })

    return {
      category: 'Livestock Farming',
      articles: articlesRes.data || []
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return {
      category: 'Livestock Farming',
      articles: []
    }
  }
}

export default async function LivestockFarmingPage() {
  const { category, articles } = await getCategoryData()

  return (
    <SiteShell>
      <main className="flex-1">
        {/* HOME TOP ROTATING LEADERBOARD - below header */}
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdSlot slug="HOME_LEADERBOARD_PRIMARY" />
        </div>

        <div className="w-full px-4 py-12">
          {/* Header */}
          <div className="mb-12 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-primary"></div>
              <span className="text-sm font-semibold text-primary uppercase">Category</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
              {category} <span className="text-foreground">NEWS & INSIGHTS</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Latest articles and insights about livestock farming in Africa
            </p>
          </div>

          {/* Featured Article */}
          {articles.length > 0 && (
            <div className="mb-12">
              <div className="animate-fade-in-left">
                <ArticleCard
                  id={articles[0].id}
                  slug={articles[0].slug}
                  title={articles[0].title}
                  excerpt={articles[0].excerpt}
                  featured_image_url={articles[0].featured_image_url}
                  author={articles[0].author}
                  published_at={articles[0].published_at}
                  category={articles[0].category}
                  animationDelay={0}
                />
              </div>
            </div>
          )}

          {/* Articles */}
          {articles.length > 0 ? (
            <div className="flex gap-6 relative">
              <div className="flex-1 min-w-0">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.slice(1).map((article, index) => (
                    <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <ArticleCard
                        id={article.id}
                        slug={article.slug}
                        title={article.title}
                        excerpt={article.excerpt}
                        featured_image_url={article.featured_image_url}
                        author={article.author}
                        published_at={article.published_at}
                        category={article.category}
                        variant="list"
                        animationDelay={index}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <p className="text-muted-foreground">No articles found in this category yet.</p>
            </div>
          )}
        </div>

        {/* IN-CONTENT NATIVE BANNER */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="IN_CONTENT_NATIVE" />
        </div>

        {/* BOTTOM LEADERBOARD */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="BOTTOM_LEADERBOARD" />
        </div>

        {/* BOTTOM ROTATING LEADERBOARD */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdSlot slug="BOTTOM_ROTATOR" />
        </div>

        {/* MOBILE STICKY AD */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 w-full py-2 flex justify-center px-2 bg-background border-t border-border z-40">
          <AdSlot slug="MOBILE_STICKY" width={320} height={50} />
        </div>
      </main>
    </SiteShell>
  )
}
