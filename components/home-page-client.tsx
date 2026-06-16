import { ArticleCard } from '@/components/article-card'
import { AdSlot } from '@/components/ad-slot'
import { FeedLayout } from '@/components/feed-layout'
import Image from 'next/image'

interface HomePageClientProps {
  featured: any
  articles: any[]
  trending: any[]
}

export function HomePageClient({
  featured,
  articles,
  trending
}: HomePageClientProps) {
  // Pre-build article feed with inline ads interleaved
  const feedItems: React.ReactNode[] = []
  articles.forEach((article, index) => {
    feedItems.push(
      <div
        key={article.id}
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
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
    )

    // Insert inline ad every 7 articles as a full-width grid break
    if ((index + 1) % 7 === 0) {
      feedItems.push(
        <div key={`ad-${index}`} className="col-span-full w-full py-6 flex justify-center">
          <AdSlot slug="IN_CONTENT_NATIVE" />
        </div>
      )
    }
  })

  return (
    <div className="w-full space-y-6">
      {/* === FEATURED SECTION === */}
      {featured && (
        <section className="py-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <a href={`/articles/${featured.slug}`} className="block overflow-hidden rounded-lg group relative">
                {featured.featured_image_url && (
                  <div className="relative w-full h-80 bg-muted">
                    <Image
                      src={featured.featured_image_url}
                      alt={featured.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <p className="text-sm font-semibold text-orange-accent uppercase tracking-wider mb-2">
                          FEATURED STORY
                        </p>
                        <h2 className="font-serif text-3xl font-bold leading-tight text-balance">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-sm text-white/80 mt-2 line-clamp-2 max-w-xl">
                            {featured.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </a>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-serif text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-accent animate-pulse" />
                Trending News
              </h3>
              <div className="space-y-5">
                {trending.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`/articles/${item.articles?.slug}`}
                    className="flex gap-3 group"
                  >
                    <span className="text-orange-accent font-serif text-lg font-bold flex-shrink-0 w-6">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-orange-accent transition line-clamp-2">
                        {item.articles?.title}
                      </h4>
                      {item.articles?.category && (
                        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                          {item.articles.category}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* === IN-CONTENT AD === */}
      <div className="w-full flex justify-center">
        <AdSlot slug="IN_CONTENT_NATIVE" />
      </div>

      {/* === LATEST NEWS FEED === */}
      <section className="py-4 border-t border-border">
        <div className="mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Latest News
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated with the latest in agriculture and livestock
          </p>
        </div>

        <FeedLayout layout="grid" spacing="normal">
          {feedItems}
        </FeedLayout>
      </section>
    </div>
  )
}