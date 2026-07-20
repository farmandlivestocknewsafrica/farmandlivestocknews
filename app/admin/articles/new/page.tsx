'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload'

export default function NewArticlePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'crop_production',
    author: 'Staff Writer',
    featured_image_url: '',
    is_featured: false,
    region: 'Zambia'
  })

  // All countries in the world
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'East Timor', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Korea North', 'Korea South', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Regional', 'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ]

  // Controlled category enum - MUST match database constraint
  const categories = [
    { key: 'agribusiness', label: 'Agribusiness' },
    { key: 'crop_production', label: 'Crop Production' },
    { key: 'livestock_farming', label: 'Livestock Farming' },
    { key: 'technology_innovation', label: 'Technology & Innovation' },
    { key: 'equipment_mechanisation', label: 'Equipment & Mechanisation' },
    { key: 'nutrition', label: 'Nutrition' },
  ]

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Check if slug already exists
      const supabase = await createClient()
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', formData.slug)
        .limit(1)

      if (existing && existing.length > 0) {
        setError('An article with this title already exists. Please use a different title.')
        setSaving(false)
        return
      }

      // Create new article
      const { data, error: insertError } = await supabase
        .from('articles')
        .insert([{
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          author: formData.author,
          featured_image_url: formData.featured_image_url,
          is_featured: formData.is_featured,
          published_at: new Date().toISOString()
        }])
        .select('id')

      if (insertError) throw insertError

      // Redirect to articles list
      router.push('/admin/articles')
      router.refresh()
    } catch (err) {
      console.error('Error saving article:', err)
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-primary text-primary-foreground px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin/articles" className="flex items-center gap-2 hover:opacity-80 transition">
            <ArrowLeft className="w-5 h-5" />
            Back to Articles
          </Link>
          <h1 className="font-serif text-2xl font-bold">Create New Article</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-lg p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-foreground mb-2">
              Article Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              placeholder="Enter article title"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Slug: {formData.slug || '(auto-generated)'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-semibold text-foreground mb-2">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of the article"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-semibold text-foreground mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Full article content"
              rows={12}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          {/* Grid: Category, Author, Region */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-foreground mb-2">
                Author *
              </label>
              <input
                id="author"
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Author name"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-semibold text-foreground mb-2">
                Country
              </label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image Upload */}
          <ImageUpload
            bucket="articles"
            value={formData.featured_image_url || undefined}
            onChange={(url) => setFormData(prev => ({ ...prev, featured_image_url: url || '' }))}
            label="Featured Image"
          />

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3">
            <input
              id="is_featured"
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-foreground cursor-pointer">
              Mark as Featured Article
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-green-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Publish Article'}
            </button>
            <Link href="/admin/articles" className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
