import Link from 'next/link'
import { FileText, Users, Eye, TrendingUp, Trash2, Edit, PlusCircle, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { AdminAccountBadge } from '@/components/admin/admin-account-badge'

// Force dynamic rendering since we need cookies for auth
export const dynamic = 'force-dynamic'

async function getAdminData() {
  const supabase = await createClient()
  
  try {
    const [articlesRes, subscribersRes] = await Promise.all([
      supabase.from('articles').select('*').order('published_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('*').eq('is_active', true)
    ])

    const articles = articlesRes.data || []
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0)
    const trendingCount = articles.filter(a => a.is_featured).length

    return {
      totalArticles: articles.length,
      totalSubscribers: subscribersRes.data?.length || 0,
      totalViews,
      trendingCount,
      recentArticles: articles.slice(0, 5),
      subscribers: subscribersRes.data || []
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return {
      totalArticles: 0,
      totalSubscribers: 0,
      totalViews: 0,
      trendingCount: 0,
      recentArticles: [],
      subscribers: []
    }
  }
}

export default async function AdminDashboard() {
  const { totalArticles, totalSubscribers, totalViews, trendingCount, recentArticles, subscribers } = await getAdminData()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your publishing performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <AdminAccountBadge />
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
          >
            <ArrowUpRight className="w-4 h-4" />
            View Live Site
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Articles', value: totalArticles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Subscribers', value: totalSubscribers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total Views', value: totalViews, icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Featured', value: trendingCount, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">Lifetime</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-primary">Recent Content</h2>
              <Link href="/admin/articles" className="text-sm text-primary hover:underline font-medium">View All</Link>
            </div>
            <div className="divide-y divide-border">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <div key={article.id} className="p-4 hover:bg-muted/50 transition flex items-center justify-between group">
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition">{article.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{article.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  No articles found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar content for dashboard */}
        <div className="space-y-8">
          {/* Quick Stats/Info */}
          <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-serif font-bold text-xl mb-2">Growth Tip</h3>
              <p className="text-primary-foreground/80 text-sm mb-4">
                Articles with images get 2x more views. Make sure to upload featured images for all your news.
              </p>
              <Link href="/admin/articles/new" className="inline-flex items-center gap-2 text-sm font-bold bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                Create Now
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Subscribers Preview */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-primary">Subscribers</h2>
              <Link href="/admin/subscriptions" className="text-sm text-primary hover:underline font-medium">View All</Link>
            </div>
            <div className="p-4 space-y-4">
              {subscribers.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground uppercase">
                    {(sub.name || sub.email).substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
