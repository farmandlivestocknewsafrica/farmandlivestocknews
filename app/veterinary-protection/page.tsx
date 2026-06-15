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
    const articlesRes = await supabase.from('articles').select('*').eq('category', 'veterinary').order('published_at', { ascending: false })
    return { category: 'Veterinary & Protection', articles: articlesRes.data || [] }
  } catch (error) {
    return { category: 'Veterinary & Protection', articles: [] }
  }
}

export default async function VeterinaryPage() {
  const { category, articles } = await getCategoryData()
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full px-4 py-12">
        <div className="max-w-5xl mx-auto mb-12 animate-fade-in-down">
          <div className="flex items-center gap-2 mb-4"><div className="h-1 w-12 bg-primary"></div><span className="text-sm font-semibold text-primary uppercase">Category</span></div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">{category} <span className="text-foreground">NEWS & INSIGHTS</span></h1>
        </div>
        {articles.length > 0 ? (
          <FeedLayout width="xl" layout="grid" spacing="normal">
            {injectAds(articles, { itemsPerAd: 4 }).map((item, index) => {
              if (isAdItem(item)) {
                return (
                  <AdCard
                    key={item.id}
                    title="Veterinary & Animal Health Solutions"
                    description="Quality veterinary products, disease prevention, and animal health management services."
                  />
                )
              }

              const article = item
              return (
                <div key={article.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ArticleCard id={article.id} slug={article.slug} title={article.title} excerpt={article.excerpt} featured_image_url={article.featured_image_url} author={article.author} published_at={article.published_at} category={article.category} variant="list" animationDelay={index} />
                </div>
              )
            })}
          </FeedLayout>
        ) : (
          <div className="text-center py-12 animate-fade-in-up"><p className="text-muted-foreground">No articles found.</p></div>
        )}
      </main>
      <Footer />
    </div>
  )
}
