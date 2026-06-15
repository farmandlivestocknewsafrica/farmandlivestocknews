'use client'

import { Download } from 'lucide-react'

export function MediaKitDownloader() {
  async function handleClick() {
    try {
      // Fetch latest media kit metadata
      const res = await fetch('/api/media-kits')
      if (!res.ok) throw new Error('Failed to fetch media kit')

      const data = await res.json()
      const mediaKits = data.media_kits || []

      if (mediaKits.length === 0) {
        alert('No media kit available')
        return
      }

      const kit = mediaKits[0] // Latest media kit
      if (!kit.file_url) {
        alert('Media kit file not available')
        return
      }

      // Create hidden anchor element and trigger download
      const link = document.createElement('a')
      link.href = kit.file_url
      link.download = `${kit.title || 'media-kit'}.${kit.file_type || 'pdf'}`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('[v0] Download error:', err)
      alert('Failed to download media kit')
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
