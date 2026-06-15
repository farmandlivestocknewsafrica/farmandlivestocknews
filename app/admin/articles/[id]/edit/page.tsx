'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { ImageUpload } from '@/components/image-upload'

interface ArticleParams {
  params: Promise<{ id: string }>
}

export default function EditArticlePage({ params }: ArticleParams) {
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    featured_image_url: '',
    is_featured: false
  })

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      fetchArticle(p.id)
    })
  }, [params])

  async function fetchArticle(articleId: string) {
    const supabase = await createClient()
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (error) throw error
      setArticle(data)
      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: data.category || '',
        author: data.author || '',
        featured_image_url: data.featured_image_url || '',
        is_featured: data.is_featured || false
      })
    } catch (error) {
      console.error('Error fetching article:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!id) return
    setSaving(true)
    const supabase = await createClient()
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      alert('Article updated successfully!')
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Error saving article')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading article...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-6 border-b border-primary-foreground/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/articles" className="p-2 hover:bg-primary-foreground/20 rounded transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-serif font-bold">Edit Article</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-foreground text-primary rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6 animate-fade-in-up">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category & Author */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select category</option>
                <option value="agribusiness">Agribusiness</option>
                <option value="crop_production">Crop Production</option>
                <option value="livestock_farming">Livestock Farming</option>
                <option value="technology_innovation">Technology & Innovation</option>
                <option value="equipment_mechanisation">Equipment & Mechanisation</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Featured Image Upload */}
          <ImageUpload
            bucket="articles"
            value={formData.featured_image_url || undefined}
            onChange={(url) => setFormData({ ...formData, featured_image_url: url || '' })}
            label="Featured Image"
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-5 h-5 rounded border-border cursor-pointer"
            />
            <label htmlFor="featured" className="text-sm font-semibold text-foreground cursor-pointer">
              Featured Article
            </label>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  )
}
