import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // First, get the article to retrieve its image paths for cleanup
    const { data: article, error: getError } = await supabase
      .from('articles')
      .select('featured_image_path, id')
      .eq('id', id)
      .single()

    if (getError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Delete the article from database
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[v0] Error deleting article:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete article' },
        { status: 500 }
      )
    }

    // If article had a featured image in storage, delete it
    if (article.featured_image_path) {
      try {
        await supabase.storage
          .from('articles')
          .remove([article.featured_image_path])
      } catch (storageError) {
        console.warn('[v0] Could not delete article image from storage:', storageError)
        // Don't fail the operation if storage deletion fails
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Article deleted successfully'
    })
  } catch (error) {
    console.error('[v0] Error in article delete:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the article' },
      { status: 500 }
    )
  }
}
