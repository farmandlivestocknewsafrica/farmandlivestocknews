'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

interface ArticleDeleteButtonProps {
  articleId: string
  articleTitle: string
  onDelete: (id: string) => Promise<void>
  className?: string
}

export function ArticleDeleteButton({
  articleId,
  articleTitle,
  onDelete,
  className = 'p-3 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded transition'
}: ArticleDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = async () => {
    if (confirm(`Delete "${articleTitle}"? This action cannot be undone.`)) {
      startTransition(async () => {
        try {
          await onDelete(articleId)
        } catch (error) {
          console.error('[v0] Error deleting article:', error)
          alert('Failed to delete article. Please try again.')
        }
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
      title="Delete article"
    >
      <Trash2 className={`w-5 h-5 ${isPending ? 'animate-spin' : ''}`} />
    </button>
  )
}
