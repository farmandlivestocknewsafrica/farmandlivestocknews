'use client'

import { ArticleCard } from '@/components/article-card'
import { AdCard } from '@/components/ad-card'
import { AdSlot } from '@/components/ad-slot'
import { FeedLayout } from '@/components/feed-layout'
import { injectAds, isAdItem } from '@/lib/ad-placement'
import Image from 'next/image'

interface HomePageClientProps {
  featured: any
  articles: any[]
  trending: any[]
  articleChunks: any[][]
}

export function HomePageClient({
  featured,
  articles,
  trending,
  articleChunks
}: HomePageClientProps) {
  return (
    <div className="flex justify-center gap-6 px-4">
      {/* LEFT SIDEBAR - hidden on small screens */}
      <aside className="hidden 2xl:block w-[300px] flex-shrink-0">
        <div className="sticky top-24 space-y-8">
          {/* 3A. LEFT SIDE BANNER 1 */}
          <AdSlot slug="LEFT_SIDE_BANNER_1" />
          {/* 3B. LEFT SIDE BANNER 2 */}
          <AdSlot slug="LEFT_SIDE_BANNER_2" />
          {/* 3C. LEFT SIDE BANNER 3 */}
          <AdSlot slug="LEFT_SIDE_BANNER_3" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl w-full">
        <>
          {/* Featured Article Section */}
          {featured && (
            <div className="px-0 py-8 animate-fade-in-down">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Featured Image */}
                <div className="md:col-span-2 animate-fade-in-left">
                  <a href={`/articles/${featured.slug}`} className="block overflow-hidden rounded-lg group relative">
                    {featured.featured_image_url && (
                      <div className="relative w-full h-80 bg-muted">
                        <Image
                          src={featured.featured_image_url}
                          alt={featured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-6 text-white">
                            <p className="text-sm font-semibold text-orange-accent uppercase mb-2">FEATURED STORY</p>
                            <h2 className="font-serif text-3xl font-bold leading-tight text-balance">{featured.title}</h2>
                          </div>
                        </div>
                      </div>
                    )}
                  </a>
                </div>

                {/* Trending Sidebar */}
                <div className="bg-card border border-border rounded-lg p-6 animate-fade-in-right">
                  <h3 className="font-serif text-xl font-bold text-primary mb-4">Trending News</h3>
                  <div className="space-y-4">
                    {trending.map((item, idx) => (
                      <a
                        key={item.id}
                        href={`/articles/${item.articles?.slug}`}
                        className="flex gap-3 group"
                      >
                        <span className="text-primary font-serif text-lg font-bold flex-shrink-0">{idx + 1}.</span>
                        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition line-clamp-2">
                          {item.articles?.title}
                        </h4>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Latest News - Clean Feed Layout */}
          <div className="w-full py-8">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-primary animate-fade-in-down">Latest News</h2>
            </div>
            
            <div className="flex justify-center">
              <FeedLayout width="xl" layout="grid" spacing="normal">
                {injectAds(articles, { itemsPerAd: 4 }).map((item, index) => {
                  if (isAdItem(item)) {
                    return (
                      <AdCard
                        key={item.id}
                        title="Featured Agricultural Content"
                        description="Explore the latest insights, trends, and stories from the agriculture sector."
                      />
                    )
                  }

                  const article = item
                  return (
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
                        variant="list"
                        animationDelay={index}
                      />
                    </div>
                  )
                })}
              </FeedLayout>
            </div>
          </div>
        </>
      </div>

      {/* RIGHT SIDEBAR - hidden on small screens */}
      <aside className="hidden 2xl:block w-[300px] flex-shrink-0">
        <div className="sticky top-24 space-y-8">
          {/* 3D. RIGHT SIDE BANNER 1 */}
          <AdSlot slug="RIGHT_SIDE_BANNER_1" />
          {/* 3E. RIGHT SIDE BANNER 2 */}
          <AdSlot slug="RIGHT_SIDE_BANNER_2" />
          {/* 3F. RIGHT SIDE BANNER 3 */}
          <AdSlot slug="RIGHT_SIDE_BANNER_3" />
        </div>
      </aside>
    </div>
  )
}
