'use client'

import { Download } from 'lucide-react'

export function MediaKitDownloader() {
  async function handleClick() {
    try {
      console.log('[MediaKit] Fetching media kits...')
      // Fetch latest media kit metadata
      const res = await fetch('/api/media-kits')
      if (!res.ok) {
        console.error('[MediaKit] API response not OK:', res.status, res.statusText)
        throw new Error(`Failed to fetch media kit: ${res.status}`)
      }

      const data = await res.json()
      console.log('[MediaKit] API response:', data)
      const mediaKits = data.media_kits || []

      if (mediaKits.length === 0) {
        console.log('[MediaKit] No media kits available')
        alert('No media kit available')
        return
      }

      const kit = mediaKits[0] // Latest media kit
      console.log('[MediaKit] Selected kit:', kit)
      
      if (!kit.file_url) {
        console.error('[MediaKit] Kit has no file_url:', kit)
        alert('Media kit file not available')
        return
      }

      // Create hidden anchor element and trigger download directly
      // (no HEAD request to avoid CORS issues with external URLs)
      const link = document.createElement('a')
      link.href = kit.file_url
      link.download = `${kit.title || 'media-kit'}.${kit.file_type || 'pdf'}`
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('[MediaKit] Download triggered')
    } catch (err) {
      console.error('[MediaKit] Download error:', err)
      alert(`Failed to download media kit: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick()
      }}
      type="button"
      className="hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
      title="Download latest media kit"
    >
      <Download className="w-4 h-4" />
      Media Kit
    </button>
  )
}
