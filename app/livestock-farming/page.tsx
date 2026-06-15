import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdCard } from '@/components/ad-card'
import { FeedLayout } from '@/components/feed-layout'
import { injectAds, isAdItem } from '@/lib/ad-placement'
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full px-4 py-12">
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-12 animate-fade-in-down">
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

        {/* Articles List */}
        {articles.length > 0 ? (
          <FeedLayout width="xl" layout="grid" spacing="normal">
            {injectAds(articles, { itemsPerAd: 4 }).map((item, index) => {
              if (isAdItem(item)) {
                return (
                  <AdCard
                    key={item.id}
                    title="Livestock & Animal Husbandry Solutions"
                    description="Best practices, veterinary care, and management solutions for profitable livestock farming."
                  />
                )
              }

              const article = item
              return (
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
              )
            })}
          </FeedLayout>
        ) : (
          <div className="text-center py-12 animate-fade-in-up">
            <p className="text-muted-foreground">No articles found in this category yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
