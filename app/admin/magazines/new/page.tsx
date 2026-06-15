'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload'

export default function NewMagazine() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/magazines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          issue_number: formData.get('issue_number'),
          publication_date: new Date(formData.get('publication_date') as string).toISOString(),
          description: formData.get('description') || null,
          pages_count: formData.get('pages_count') ? parseInt(formData.get('pages_count') as string) : null,
          cover_image_url: coverImageUrl,
          pdf_url: pdfUrl
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create magazine')
      }

      router.push('/admin/magazines')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create magazine')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Publish New Magazine</h1>
            <p className="text-muted-foreground">Create and publish a new digital magazine issue</p>
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
                  name="title"
                  placeholder="e.g., Farm & Livestock Weekly"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Issue Number */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Issue Number *</label>
                <input
                  type="text"
                  name="issue_number"
                  placeholder="e.g., Vol. 1 No. 1 or #45"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Publication Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Publication Date *</label>
                <input
                  type="datetime-local"
                  name="publication_date"
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
                  name="pages_count"
                  placeholder="e.g., 32"
                  min="1"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Brief description of this magazine issue..."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !pdfUrl}
                  className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-green-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Magazine'}
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
