import { SiteShell } from '@/components/site-shell'
import { ArticleCard } from '@/components/article-card'
import { InfiniteArticles } from '@/components/infinite-articles'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

// Slug to category key mapping
const SLUG_TO_KEY: Record<string, string> = {
  'agribusiness': 'agribusiness',
  'crop-production': 'crop_production',
  'crops': 'crop_production', // Legacy support
  'livestock-farming': 'livestock_farming',
  'livestock': 'livestock_farming', // Legacy support
  'technology-innovation': 'technology_innovation',
  'tech': 'technology_innovation', // Legacy support
  'equipment-mechanisation': 'equipment_mechanisation',
  'nutrition': 'nutrition'
}

// Key to display name mapping
const KEY_TO_NAME: Record<string, string> = {
  'agribusiness': 'Agribusiness',
  'crop_production': 'Crop Production',
  'livestock_farming': 'Livestock Farming',
  'technology_innovation': 'Technology & Innovation',
  'equipment_mechanisation': 'Equipment & Mechanisation',
  'nutrition': 'Nutrition'
}

async function getCategoryData(categorySlug: string) {
  const supabase = await createClient()
  
  // Convert slug to category key
  const categoryKey = SLUG_TO_KEY[categorySlug]
  if (!categoryKey) {
    return null
  }

  try {
    const articlesRes = await supabase
      .from('articles')
      .select('*')
      .eq('category', categoryKey)
      .order('published_at', { ascending: false })
      .limit(12) // Load first 12 for initial page

    return {
      categoryKey,
      categoryName: KEY_TO_NAME[categoryKey],
      articles: articlesRes.data || []
    }
  } catch (error) {
    console.error('[v0] Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params
  const data = await getCategoryData(categorySlug)

  if (!data) {
    notFound()
  }

  const { categoryKey, categoryName, articles } = data

  return (
    <SiteShell>
      <main className="flex-1 relative">
        {/* HOME TOP ROTATING LEADERBOARD - below header */}
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
        </div>

        <div className="w-full px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-primary"></div>
            <span className="text-sm font-semibold text-primary uppercase">Category</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
            {categoryName} <span className="text-foreground">NEWS & INSIGHTS</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Latest articles and insights about {categoryName.toLowerCase()} in Africa
          </p>
        </div>

        {/* Featured Article */}
        {articles.length > 0 && (
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ArticleCard
                  id={articles[0].id}
                  slug={articles[0].slug}
                  title={articles[0].title}
                  excerpt={articles[0].excerpt}
                  featured_image_url={articles[0].featured_image_url}
                  author={articles[0].author}
                  published_at={articles[0].published_at}
                  category={articles[0].category}
                />
              </div>
              <div className="bg-card border border-border rounded-lg p-6 h-fit">
                <h3 className="font-semibold text-primary mb-4">Category Info</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    All articles in <strong className="text-foreground">{categoryName}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Scroll down to load more articles
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Infinite Scroll Articles */}
        {articles.length > 0 ? (
          <div className="flex gap-10 xl:gap-14 2xl:gap-20 items-start relative">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">All Articles</h2>
              <InfiniteArticles 
                initialArticles={articles.slice(1)} 
                category={categoryKey}
                limit={12}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found in this category yet.</p>
          </div>
        )}
      </div>

        {/* IN-CONTENT NATIVE BANNER */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="IN_CONTENT_NATIVE" variant="native" />
        </div>

        {/* BOTTOM LEADERBOARD */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
        </div>

        {/* BOTTOM ROTATING LEADERBOARD */}
        <div className="w-full py-3 flex justify-center px-4">
          <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
        </div>

        <MobileInlineAd />
      </main>
    </SiteShell>
  )
}
