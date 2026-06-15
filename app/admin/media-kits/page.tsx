'use client'

import Link from 'next/link'
import { Edit2, Plus, Loader2, Home, Download, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface MediaKit {
  id: string
  title: string
  description: string | null
  issue_date: string | null
  file_url: string | null
  file_type: string | null
  file_size_kb: number | null
  cover_image_url: string | null
  status: string
  downloads: number | null
}

export default function MediaKitsManagement() {
  const [mediaKits, setMediaKits] = useState<MediaKit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchMediaKits()
  }, [])

  async function fetchMediaKits() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/media-kits')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch media kits')
      }
      
      setMediaKits(data.media_kits || [])
    } catch (err) {
      console.error('[v0] Failed to fetch media kits:', err)
      setError(err instanceof Error ? err.message : 'Failed to load media kits')
      setMediaKits([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this media kit?')) {
      return
    }
    
    try {
      setDeleting(id)
      const res = await fetch(`/api/admin/media-kits/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete media kit')
      }
      
      setMediaKits(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error('[v0] Failed to delete media kit:', err)
      alert('Failed to delete media kit')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <Download className="w-8 h-8" />
            Media Kits
          </h1>
          <p className="text-muted-foreground">Manage advertising media kits and rate cards</p>
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
            href="/admin/media-kits/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Media Kit
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading media kits...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-6 rounded-xl border border-destructive/20">
          <p className="font-bold mb-2 text-lg text-primary">Error loading media kits</p>
          <p className="text-sm opacity-90">{error}</p>
          <button 
            onClick={fetchMediaKits}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-bold"
          >
            Try Again
          </button>
        </div>
      ) : mediaKits.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaKits.map((kit) => (
            <div key={kit.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col">
              {/* Cover Image */}
              <div className="relative w-full h-48 bg-muted">
                {kit.cover_image_url ? (
                  <Image
                    src={kit.cover_image_url}
                    alt={kit.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Download className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded uppercase">
                  {kit.status}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-serif text-xl font-bold text-primary mb-1">{kit.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Date: {kit.issue_date ? new Date(kit.issue_date).toLocaleDateString() : '-'}
                </p>
                {kit.description && (
                  <p className="text-sm text-foreground mb-4 line-clamp-2 italic">{kit.description}</p>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-muted/50 rounded-lg text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium uppercase text-[10px]">Downloads</p>
                    <p className="font-bold text-foreground text-base">{kit.downloads || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium uppercase text-[10px]">Format</p>
                    <p className="font-bold text-foreground text-base uppercase">{kit.file_type || 'PDF'}</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Link
                    href={`/admin/media-kits/${kit.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition text-sm font-bold"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(kit.id)}
                    disabled={deleting === kit.id}
                    className="px-3 py-2 border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                    title="Delete media kit"
                  >
                    {deleting === kit.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-20 text-center">
          <Download className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6 font-medium">No media kits published yet</p>
          <Link
            href="/admin/media-kits/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl hover:opacity-90 transition font-bold"
          >
            <Plus className="w-5 h-5" />
            Upload Your First Media Kit
          </Link>
        </div>
      )}
    </div>
  )
}
