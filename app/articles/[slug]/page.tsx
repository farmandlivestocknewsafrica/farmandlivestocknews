import { SiteShell } from '@/components/site-shell'
import { ArticleCard } from '@/components/article-card'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

async function getArticleData(slug: string) {
  const supabase = await createClient()
  
  try {
    const articleRes = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!articleRes.data) {
      return null
    }

    const relatedRes = await supabase
      .from('articles')
      .select('*')
      .eq('category', articleRes.data.category)
      .neq('id', articleRes.data.id)
      .order('published_at', { ascending: false })
      .limit(3)

    return {
      article: articleRes.data,
      related: relatedRes.data || []
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

function splitContent(content: string) {
  return content.split('\n\n').filter(p => p.trim())
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const data = await getArticleData(slug)

  if (!data) {
    notFound()
  }

  const { article, related } = data
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const contentParts = splitContent(article.content || '')

  return (
    <SiteShell>
      <div className="py-8">
        {/* Article Header - Title, Meta, Category */}
        <div className="mb-10 max-w-4xl mx-auto px-0">
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-orange-accent text-accent-foreground text-xs font-semibold rounded-full uppercase">
              {article.category}
            </span>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 text-balance">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-muted-foreground">
            <div>
              <p className="text-sm font-semibold text-foreground">{article.author}</p>
              <p className="text-xs">Author</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">{article.view_count || 0}</p>
              <p className="text-xs">Views</p>
            </div>
          </div>
        </div>

        {/* TOP ARTICLE AD */}
        <div className="w-full py-2 flex justify-center mb-10">
          <AdPlacement slug="ARTICLE_TOP" variant="leaderboard" />
        </div>

        {/* Article Hero Image - Full Width */}
        {article.featured_image_url && (
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-muted mb-10">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Article Content - Centered max-width container */}
        <div className="max-w-4xl mx-auto px-0">
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground italic font-semibold mb-6 pb-6 border-b border-border">
              {article.excerpt}
            </p>
          )}

          <article className="prose prose-lg max-w-none mb-10">
            {contentParts.map((part, idx) => (
              <div key={idx}>
                <p className="text-foreground leading-relaxed mb-4">{part}</p>
                {idx === Math.floor(contentParts.length / 2) - 1 && contentParts.length > 2 && (
                  <div className="w-full py-4 flex justify-center not-prose">
                    <AdPlacement slug="ARTICLE_MIDDLE" variant="native" />
                  </div>
                )}
              </div>
            ))}
          </article>

          {/* Author Bio */}
          <div className="bg-card border border-border rounded-lg p-5 sm:p-6 mb-10">
            <div className="flex gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-base sm:text-lg">
                  {article.author.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">{article.author}</h3>
                <p className="text-sm text-muted-foreground">
                  Agricultural journalist and expert covering farming practices and agribusiness across Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <div className="bg-muted py-10 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {related.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  id={relatedArticle.id}
                  slug={relatedArticle.slug}
                  title={relatedArticle.title}
                  excerpt={relatedArticle.excerpt}
                  featured_image_url={relatedArticle.featured_image_url}
                  author={relatedArticle.author}
                  published_at={relatedArticle.published_at}
                  category={relatedArticle.category}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom article slots */}
      <div className="w-full py-4 flex justify-center">
        <AdPlacement slug="ARTICLE_BOTTOM" variant="leaderboard" />
      </div>
      <div className="w-full py-4 flex justify-center">
        <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
      </div>
      <div className="w-full py-4 flex justify-center">
        <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
      </div>
      <MobileInlineAd />
    </SiteShell>
  )
}