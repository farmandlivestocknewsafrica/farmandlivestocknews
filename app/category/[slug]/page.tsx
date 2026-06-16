import { Header } from '@/components/header'
import { TopBar } from '@/components/top-bar'
import { Footer } from '@/components/footer'
import { ArticleCard } from '@/components/article-card'
import { AdSlot } from '@/components/ad-slot'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

async function getCategoryData(slug: string) {
  const supabase = await createClient()

  try {
    // Get category
    const { data: category, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('slug', slug)
      .single()

    if (catError || !category) {
      return null
    }

    // Get articles in this category
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category.name)
      .order('published_at', { ascending: false })

    if (artError) {
      console.error('Error fetching articles:', artError)
      return { category, articles: [] }
    }

    return { category, articles: articles || [] }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, articles } = data

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />

      <main className="flex-1">
        {/* HOME TOP ROTATING LEADERBOARD - below header */}
        <div className="w-full py-3 flex justify-center px-4 bg-muted/20">
          <AdSlot slug="HOME_LEADERBOARD_PRIMARY" />
        </div>

        {/* Category Header */}
        <div className="bg-primary text-primary-foreground py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="font-serif text-4xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-primary-foreground/80 text-lg">{category.description}</p>
            )}
            <p className="text-sm text-primary-foreground/70 mt-2">
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Articles with Side Banners */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg">No articles found in this category yet.</p>
            </div>
          ) : (
            <div className="flex gap-6 relative">
              {/* LEFT SIDEBAR BANNERS */}
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
                <div className="grid md:grid-cols-3 gap-6">
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
                        animationDelay={index}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDEBAR BANNERS */}
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

      <Footer />
    </div>
  )
}
