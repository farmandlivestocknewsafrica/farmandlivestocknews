import { SiteShell } from '@/components/site-shell'
import { ArticleCard } from '@/components/article-card'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'

async function getCategoryData() {
  const supabase = await createClient()
  
  try {
    const articlesRes = await supabase
      .from('articles')
      .select('*')
      .eq('category', 'crop_production')
      .order('published_at', { ascending: false })

    return {
      category: 'Crop Production',
      articles: articlesRes.data || []
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return {
      category: 'Crop Production',
      articles: []
    }
  }
}

export default async function CropProductionPage() {
  const { category, articles } = await getCategoryData()

  return (
    <SiteShell>
      <main className="flex-1">
        {/* HOME TOP ROTATING LEADERBOARD */}
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
        </div>

        <div className="w-full px-4 py-12">
          <div className="mb-12 animate-fade-in-down">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-12 bg-primary"></div>
              <span className="text-sm font-semibold text-primary uppercase">Category</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
              {category} <span className="text-foreground">NEWS & INSIGHTS</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Latest articles and insights about crop production in Africa
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="flex gap-10 xl:gap-14 2xl:gap-20 items-start relative">
              <div className="flex-1 min-w-0">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article, index) => (
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

        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="IN_CONTENT_NATIVE" variant="native" />
        </div>
        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
        </div>
        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
        </div>
        <MobileInlineAd />
      </main>
    </SiteShell>
  )
}
