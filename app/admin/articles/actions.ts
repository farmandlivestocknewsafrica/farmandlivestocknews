'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteArticle(articleId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/articles/${articleId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete article')
    }

    // Revalidate the articles list page
    revalidatePath('/admin/articles')

    return { success: true }
  } catch (error) {
    console.error('[v0] Error deleting article:', error)
    throw error
  }
}
