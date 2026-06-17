import { SiteShell } from '@/components/site-shell'
import { ArticleCard } from '@/components/article-card'
import { InfiniteArticles } from '@/components/infinite-articles'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

// Slug to category key mapping — single source of truth for routing
// Maps URL slugs -> DB category enum values
const SLUG_TO_KEY: Record<string, string> = {
  // Agribusiness
  'agribusiness-investment': 'agribusiness',
  'agribusiness': 'agribusiness',
  // Crop Production
  'crop-production': 'crop_production',
  'crops': 'crop_production',
  // Livestock Farming
  'livestock-farming': 'livestock_farming',
  'livestock': 'livestock_farming',
  // Technology & Innovation
  'agritech-innovation': 'technology_innovation',
  'technology-innovation': 'technology_innovation',
  'tech': 'technology_innovation',
  // Equipment & Mechanization
  'equipment-mechanization': 'equipment_mechanisation',
  'equipment-mechanisation': 'equipment_mechanisation',
  // Inputs & Nutrition
  'inputs-nutrition': 'nutrition',
  'nutrition': 'nutrition',
  // Policy & Regulations
  'policy-regulations': 'policy_regulations',
  'policy': 'policy_regulations',
  // Veterinary & Protection
  'veterinary-protection': 'veterinary_protection',
  'veterinary': 'veterinary_protection',
}

// Key to display name mapping
const KEY_TO_NAME: Record<string, string> = {
  'agribusiness': 'Agribusiness',
  'crop_production': 'Crop Production',
  'livestock_farming': 'Livestock Farming',
  'technology_innovation': 'Technology & Innovation',
  'equipment_mechanisation': 'Equipment & Mechanization',
  'nutrition': 'Nutrition',
  'policy_regulations': 'Policy & Regulations',
  'veterinary_protection': 'Veterinary & Protection',
}

// Key to description mapping for category page headers
const KEY_TO_DESCRIPTION: Record<string, string> = {
  'agribusiness': 'agribusiness and investment',
  'crop_production': 'crop production',
  'livestock_farming': 'livestock farming',
  'technology_innovation': 'agritech and innovation',
  'equipment_mechanisation': 'equipment and mechanization',
  'nutrition': 'inputs and nutrition',
  'policy_regulations': 'policy and regulations',
  'veterinary_protection': 'veterinary and protection',
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
      .limit(12)

    return {
      categoryKey,
      categoryName: KEY_TO_NAME[categoryKey] || categoryKey,
      description: KEY_TO_DESCRIPTION[categoryKey] || categoryKey.replace(/_/g, ' '),
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

  const { categoryKey, categoryName, description, articles } = data

  return (
    <SiteShell>
      {/* TOP LEADERBOARD */}
      <div className="w-full py-3 flex justify-center bg-muted/20">
        <AdPlacement slug="HOME_LEADERBOARD_PRIMARY" variant="leaderboard" />
      </div>

      <div className="py-8">
        {/* Category Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-primary"></div>
            <span className="text-sm font-semibold text-primary uppercase">Category</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 text-balance">
            {categoryName} <span className="text-foreground">NEWS & INSIGHTS</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            Latest articles and insights about {description} in Africa
          </p>
        </div>

        {/* Featured Article + Sidebar Info */}
        {articles.length > 0 && (
          <div className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="bg-card border border-border rounded-lg p-5 sm:p-6 h-fit">
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

        {/* All Articles - Infinite Scroll */}
        {articles.length > 0 ? (
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-6">All Articles</h2>
            <InfiniteArticles 
              initialArticles={articles.slice(1)} 
              category={categoryKey}
              limit={12}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found in this category yet.</p>
          </div>
        )}
      </div>

      {/* Bottom Ad Placements */}
      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="IN_CONTENT_NATIVE" variant="native" />
      </div>
      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
      </div>
      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
      </div>
      <MobileInlineAd />
    </SiteShell>
  )
}