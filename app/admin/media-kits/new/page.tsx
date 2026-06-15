'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload'

export default function NewMediaKit() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/admin/media-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description') || null,
          issue_date: formData.get('issue_date') ? new Date(formData.get('issue_date') as string).toISOString() : null,
          cover_image_url: coverImageUrl,
          file_url: fileUrl,
          status: 'published'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create media kit')
      }

      router.push('/admin/media-kits')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create media kit')
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
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Upload New Media Kit</h1>
            <p className="text-muted-foreground">Upload a new advertising media kit or rate card</p>
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
                  name="title"
                  placeholder="e.g., 2024 Advertising Media Kit"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Effective Date</label>
                <input
                  type="date"
                  name="issue_date"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  name="description"
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
                  {isSubmitting ? 'Uploading...' : 'Upload Media Kit'}
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
