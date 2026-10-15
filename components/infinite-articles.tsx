
'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArticleCard } from '@/components/article-card'
import { Loader2 } from 'lucide-react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  featured_image_url: string | null
  author: string | null
  published_at: string | null
  category: string
}

interface PaginatedArticlesProps {
  category?: string
  limit?: number
}

interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  totalPages: number
  error?: string
}

export function PaginatedArticles({
  category,
  limit = 20,
}: PaginatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = useCallback(async (pageNumber: number) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: String(limit),
      })

      if (category) {
        params.set('category', category)
      }

      const response = await fetch(
        `/api/v1/articles?${params.toString()}`,
        { cache: 'no-store' }
      )

      const data = (await response.json()) as ArticlesResponse

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load articles.')
      }

      setArticles(data.articles || [])
      setPage(data.page || pageNumber)
      setTotalPages(data.totalPages || 0)
      setTotal(data.total || 0)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      )
    } finally {
      setLoading(false)
    }
  }, [category, limit])

  useEffect(() => {
    void fetchArticles(1)
  }, [fetchArticles])

  const goToPage = (pageNumber: number) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === page ||
      loading
    ) {
      return
    }

    setArticles([])
    void fetchArticles(pageNumber)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)

    const pages: number[] = []

    for (let number = start; number <= end; number++) {
      pages.push(number)
    }

    return pages
  }

  if (loading && articles.length === 0 && !error) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          type="button"
          onClick={() => void fetchArticles(page)}
          className="rounded-md bg-primary px-5 py-2 text-primary-foreground hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No articles found in this category yet.
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6">
        Showing {(page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total} articles
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="w-full">
            <ArticleCard
              id={article.id}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt || ''}
              featured_image_url={article.featured_image_url || ''}
              author={article.author || ''}
              published_at={article.published_at || ''}
              category={article.category}
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="py-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Article pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1 || loading}
            className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>

          {page > 3 && (
            <>
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={loading}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40"
              >
                1
              </button>
              {page > 4 && (
                <span className="px-1 text-muted-foreground">…</span>
              )}
            </>
          )}

          {getPageNumbers().map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => goToPage(number)}
              disabled={loading}
              aria-current={page === number ? 'page' : undefined}
              className={`rounded-md border px-3 py-2 text-sm disabled:opacity-40 ${
                page === number
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {number}
            </button>
          ))}

          {page < totalPages - 2 && (
            <>
              {page < totalPages - 3 && (
                <span className="px-1 text-muted-foreground">…</span>
              )}
              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                disabled={loading}
                className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </nav>
      )}

      {totalPages > 1 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  )
}
