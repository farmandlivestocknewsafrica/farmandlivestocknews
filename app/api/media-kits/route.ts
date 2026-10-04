import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
try {
const body = await req.json()

const {
title,
description,
issue_date,
file_type,
file_size_kb,
cover_image_url,
file_url,
} = body

// Validate required fields
if (!title || !file_url) {
return NextResponse.json(
{
message: 'Title and file URL are required',
error: 'Missing title or file_url',
},
{ status: 400 }
)
}

const supabase = await createClient()

const { data, error } = await supabase
.from('media_kits')
.insert({
title,
description: description || null,
issue_date: issue_date || null,
file_url,
file_type: file_type || null,
file_size_kb: file_size_kb || null,
cover_image_url: cover_image_url || null,
available_for_download: true,
featured: false,
status: 'published',
})
.select()

if (error) {
// Log the COMPLETE Supabase error so we can identify the exact problem
console.error('[MediaKit] Supabase INSERT error:', {
message: error.message,
details: error.details,
hint: error.hint,
code: error.code,
})

return NextResponse.json(
{
message: 'Failed to create media kit',
error: error.message,
details: error.details,
hint: error.hint,
code: error.code,
},
{ status: 500 }
)
}

return NextResponse.json(
{
message: 'Media kit created successfully',
data,
},
{ status: 200 }
)
} catch (error) {
console.error('[MediaKit] POST error:', error)

return NextResponse.json(
{
message: 'An error occurred while creating the media kit',
error: error instanceof Error ? error.message : String(error),
},
{ status: 500 }
)
}
}

export async function GET() {
try {
const supabase = await createClient()

const { data, error } = await supabase
.from('media_kits')
.select('*')
.eq('status', 'published')
.order('issue_date', { ascending: false })

if (error) {
console.error('[MediaKit] Supabase SELECT error:', {
message: error.message,
details: error.details,
hint: error.hint,
code: error.code,
})

return NextResponse.json(
{
media_kits: [],
error: error.message,
details: error.details,
hint: error.hint,
code: error.code,
},
{ status: 500 }
)
}

return NextResponse.json({
media_kits: data || [],
})
} catch (error) {
console.error('[MediaKit] GET error:', error)

return NextResponse.json(
{
media_kits: [],
error: error instanceof Error ? error.message : String(error),
},
{ status: 500 }
)
}
}
