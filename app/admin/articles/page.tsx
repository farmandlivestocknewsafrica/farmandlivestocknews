import Link from 'next/link'
import Image from 'next/image'
import { Edit, ImageIcon, PlusCircle, Home, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ArticleDeleteButton } from '@/components/article-delete-button'
import { deleteArticle } from './actions'

async function getArticles() {
  const supabase = await createClient()
  
  try {
    const res = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })

    return res.data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Articles</h1>
          <p className="text-muted-foreground">Manage and edit your published content</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            New Article
          </Link>
        </div>
      </div>

      {/* Filters/Search (Visual only for now) */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search articles..." 
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {articles.length > 0 ? (
          <div className="divide-y divide-border">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition group"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {article.featured_image_url ? (
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-muted">
                      <Image
                        src={article.featured_image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {article.author} • {new Date(article.published_at).toLocaleDateString()} • {article.view_count || 0} views
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded tracking-wider">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      title="Edit article"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <ArticleDeleteButton
                      articleId={article.id}
                      articleTitle={article.title}
                      onDelete={deleteArticle}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No articles found.</p>
            <Link
              href="/admin/articles/new"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Article
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
