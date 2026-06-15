'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload'
import { Loader2 } from 'lucide-react'

interface EditMediaKitProps {
  params: Promise<{ id: string }>
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export default function EditMediaKit({ params }: EditMediaKitProps) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    issue_date: '',
    status: 'published'
  })

  useEffect(() => {
    params.then((p) => {
      setId(p.id)
      fetchMediaKit(p.id)
    })
  }, [params])

  async function fetchMediaKit(kitId: string) {
    try {
      setLoading(true)
      setLoadError('')
      const res = await fetch('/api/admin/media-kits')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load media kits')

      const kit = data.media_kits.find((k: any) => k.id === kitId)
      if (!kit) throw new Error('Media kit not found')

      setForm({
        title: kit.title || '',
        description: kit.description || '',
        issue_date: toLocalInputValue(kit.issue_date),
        status: kit.status || 'published'
      })
      setCoverImageUrl(kit.cover_image_url || null)
      setFileUrl(kit.file_url || null)
    } catch (err) {
      console.error('[v0] Failed to load media kit:', err)
      setLoadError(err instanceof Error ? err.message : 'Failed to load media kit')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/media-kits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          issue_date: form.issue_date ? new Date(form.issue_date).toISOString() : null,
          cover_image_url: coverImageUrl,
          file_url: fileUrl,
          status: form.status,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update media kit')
      }

      router.push('/admin/media-kits')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update media kit')
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
            <p className="text-muted-foreground">Loading media kit...</p>
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
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              <p className="font-semibold mb-2 text-primary">Error loading media kit</p>
              <p className="text-sm">{loadError}</p>
              <Link
                href="/admin/media-kits"
                className="inline-block mt-3 px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition text-sm font-semibold"
              >
                Back to Media Kits
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
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Edit Media Kit</h1>
            <p className="text-muted-foreground">Update media kit details and files</p>
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
                <label className="block text-sm font-semibold text-foreground mb-2">Media Kit Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Effective Date</label>
                <input
                  type="date"
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Cover Image Upload */}
              <ImageUpload
                bucket="media-kits"
                value={coverImageUrl || undefined}
                onChange={setCoverImageUrl}
                label="Cover Image Preview"
              />

              {/* File Upload */}
              <ImageUpload
                bucket="media-kits"
                value={fileUrl || undefined}
                onChange={setFileUrl}
                label="Media Kit PDF *"
                accept="application/pdf"
                maxSizeMB={20}
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of this media kit..."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !fileUrl}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-green-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  href="/admin/media-kits"
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
