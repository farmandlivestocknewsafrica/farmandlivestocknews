'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArticleCard } from '@/components/article-card'
import { Loader2 } from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  featured_image_url: string
  author: string
  published_at: string
  category: string
}

interface InfiniteArticlesProps {
  initialArticles: Article[]
  category?: string
  limit?: number
}

export function InfiniteArticles({ initialArticles, category, limit = 12 }: InfiniteArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialArticles.length >= limit)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  // Initialize next cursor from initial articles
  useEffect(() => {
    if (initialArticles.length >= limit && initialArticles.length > 0) {
      const lastArticle = initialArticles[initialArticles.length - 1]
      setNextCursor(lastArticle.published_at)
    }
  }, [initialArticles, limit])

  // Fetch next batch of articles
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !nextCursor) return

    isLoadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        cursor: nextCursor
      })

      if (category) {
        params.append('category', category)
      }

      const res = await fetch(`/api/v1/articles?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch articles')

      const data = await res.json()
      
      // Update articles list
      setArticles(prev => [...prev, ...data.articles])
      
      // Update cursor for next page
      setNextCursor(data.nextCursor || null)
      
      // Update hasMore flag
      setHasMore(!!data.nextCursor)
    } catch (err) {
      console.error('[v0] Error loading more articles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load articles')
    } finally {
      isLoadingRef.current = false
      setLoading(false)
    }
  }, [nextCursor, category, limit, hasMore])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingRef.current && nextCursor) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current)
      }
    }
  }, [loadMore, hasMore, nextCursor])

  return (
    <>
      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div key={article.id} className="animate-fade-in-up w-full" style={{ animationDelay: `${index * 50}ms` }}>
            <ArticleCard
              id={article.id}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              featured_image_url={article.featured_image_url}
              author={article.author}
              published_at={article.published_at}
              category={article.category}
            />
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="py-12 text-center text-destructive">
          <p>{error}</p>
          <button
            onClick={loadMore}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Sentinel for infinite scroll trigger */}
      {hasMore && !error && (
        <div ref={sentinelRef} className="py-12 flex justify-center">
          {loading && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
        </div>
      )}

      {/* End of articles message */}
      {!hasMore && articles.length > 0 && (
        <div className="py-12 text-center text-muted-foreground">
          <p>No more articles to load</p>
        </div>
      )}

      {/* Empty state */}
      {articles.length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground">
          <p>No articles found</p>
        </div>
      )}
    </>
  )
}