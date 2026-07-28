'use client'

import { Download } from 'lucide-react'

interface Props {
id: string
pdfUrl: string
}

export function MagazineDownloadButton({ id, pdfUrl }: Props) {
async function handleDownload() {
try {
// Increase the download count
await fetch(`/api/magazines/${id}/download`, {
method: 'POST'
})

// Trigger the actual download
const link = document.createElement('a')
link.href = pdfUrl
link.download = ''
link.target = '_blank'
document.body.appendChild(link)
link.click()
document.body.removeChild(link)
} catch (error) {
console.error('Download error:', error)
// Still allow download even if counting fails
window.open(pdfUrl, '_blank')
}
}

return (
<button
onClick={handleDownload}
className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
>
<Download className="w-5 h-5" />
Download PDF
</button>
)
}
