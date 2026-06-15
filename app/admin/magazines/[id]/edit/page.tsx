'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload'
import { Loader2 } from 'lucide-react'

interface EditMagazineProps {
  params: Promise<{ id: string }>
}

// Convert an ISO timestamp to the value format expected by datetime-local inputs
function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
}

export default function EditMagazine({ params }: EditMagazineProps) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    issue_number: '',
    publication_date: '',
    pages_count: '',
    description: '',
    available_for_download: true,
  })

  useEffect(() => {
    params.then((p) => {
      setId(p.id)
      fetchMagazine(p.id)
    })
  }, [params])

  async function fetchMagazine(magazineId: string) {
    try {
      setLoading(true)
      setLoadError('')
      const res = await fetch(`/api/admin/magazines/${magazineId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load magazine')

      const m = data.magazine
      setForm({
        title: m.title || '',
        issue_number: m.issue_number || '',
        publication_date: toLocalInputValue(m.publication_date),
        pages_count: m.pages_count != null ? String(m.pages_count) : '',
        description: m.description || '',
        available_for_download: m.available_for_download ?? true,
      })
      setCoverImageUrl(m.cover_image_url || null)
      setPdfUrl(m.pdf_url || null)
    } catch (err) {
      console.error('[v0] Failed to load magazine:', err)
      setLoadError(err instanceof Error ? err.message : 'Failed to load magazine')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/magazines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          issue_number: form.issue_number,
          publication_date: form.publication_date
            ? new Date(form.publication_date).toISOString()
            : null,
          pages_count: form.pages_count ? parseInt(form.pages_count, 10) : null,
          description: form.description || null,
          available_for_download: form.available_for_download,
          cover_image_url: coverImageUrl,
          pdf_url: pdfUrl,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update magazine')
      }

      router.push('/admin/magazines')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update magazine')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading magazine...</p>
          </div>
        </div>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-2">Error loading magazine</p>
              <p className="text-sm">{loadError}</p>
              <Link
                href="/admin/magazines"
                className="inline-block mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-semibold"
              >
                Back to Magazines
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Edit Magazine</h1>
            <p className="text-muted-foreground">Update magazine issue details and files</p>
          </div>

          {/* Form */}
          <div className="bg-card border border-border rounded-lg p-8">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Magazine Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Issue Number */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Issue Number *</label>
                <input
                  type="text"
                  value={form.issue_number}
                  onChange={(e) => setForm({ ...form, issue_number: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Publication Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Publication Date *</label>
                <input
                  type="datetime-local"
                  value={form.publication_date}
                  onChange={(e) => setForm({ ...form, publication_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Cover Image Upload */}
              <ImageUpload
                bucket="magazines"
                value={coverImageUrl || undefined}
                onChange={setCoverImageUrl}
                label="Cover Image"
              />

              {/* PDF Upload */}
              <ImageUpload
                bucket="magazines"
                value={pdfUrl || undefined}
                onChange={setPdfUrl}
                label="Magazine PDF *"
                accept="application/pdf"
                maxSizeMB={50}
              />

              {/* Pages Count */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Number of Pages</label>
                <input
                  type="number"
                  value={form.pages_count}
                  onChange={(e) => setForm({ ...form, pages_count: e.target.value })}
                  placeholder="e.g., 32"
                  min="1"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this magazine issue..."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Available For Download */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available_for_download"
                  checked={form.available_for_download}
                  onChange={(e) => setForm({ ...form, available_for_download: e.target.checked })}
                  className="w-5 h-5 rounded border-border cursor-pointer"
                />
                <label htmlFor="available_for_download" className="text-sm font-semibold text-foreground cursor-pointer">
                  Available for download
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !pdfUrl}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-green-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href="/admin/magazines"
                  className="flex-1 border border-border text-foreground font-semibold py-2 rounded-lg hover:bg-muted transition text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
