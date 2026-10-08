'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface MediaKit {
id: string | number
title?: string
file_url: string
file_type?: string
}

export function MediaKitDownloader() {
const [mediaKit, setMediaKit] = useState<MediaKit | null>(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
async function fetchMediaKit() {
try {
console.log('[MediaKit] Fetching latest media kit...')

const res = await fetch('/api/media-kits', {
cache: 'no-store',
})

if (!res.ok) {
console.error(
'[MediaKit] API response not OK:',
res.status,
res.statusText
)
return
}

const data = await res.json()

console.log('[MediaKit] API response:', data)

const mediaKits = data.media_kits || []

if (mediaKits.length === 0) {
console.log('[MediaKit] No media kits available')
return
}

const latestKit = mediaKits[0]

if (!latestKit?.file_url) {
console.error(
'[MediaKit] Latest media kit has no file_url:',
latestKit
)
return
}

console.log('[MediaKit] Latest media kit:', latestKit)

setMediaKit(latestKit)
} catch (error) {
console.error('[MediaKit] Failed to fetch media kit:', error)
} finally {
setLoading(false)
}
}

fetchMediaKit()
}, [])

async function handleClick() {
if (!mediaKit) {
return
}

try {
console.log('[MediaKit] Media kit link clicked')

// Record the download/click
await fetch(`/api/media-kits/${mediaKit.id}/download`, {
method: 'POST',
})
} catch (error) {
// Don't prevent the media kit from opening if tracking fails
console.error(
'[MediaKit] Failed to record download:',
error
)
}
}

// Don't show anything while checking for the media kit
if (loading) {
return null
}

// If no media kit exists, don't show a broken link
if (!mediaKit) {
return null
}

return (
<a
href={mediaKit.file_url}
target="_blank"
rel="noopener noreferrer"
onClick={handleClick}
className="hover:underline font-semibold flex items-center gap-1 transition cursor-pointer"
title="Open latest media kit"
>
<Download className="w-4 h-4" />
Media Kit
</a>
)
}
