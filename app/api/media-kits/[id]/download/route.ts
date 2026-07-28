import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
request: Request,
{ params }: { params: Promise<{ id: string }> }
) {
try {
const { id } = await params
const supabase = await createClient()

// Get current download count
const { data: kit } = await supabase
.from('media_kits')
.select('downloads')
.eq('id', id)
.single()

if (!kit) {
return NextResponse.json({ error: 'Media kit not found' }, { status: 404 })
}

// Increase the count by 1
await supabase
.from('media_kits')
.update({ downloads: (kit.downloads || 0) + 1 })
.eq('id', id)

return NextResponse.json({ success: true })
} catch (error) {
console.error('Error updating download count:', error)
return NextResponse.json({ error: 'Failed to update count' }, { status: 500 })
}
}
