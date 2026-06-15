'use client'

import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

interface DeleteButtonProps {
  action: () => Promise<void>
  confirmMessage?: string
  className?: string
}

export function DeleteButton({ 
  action, 
  confirmMessage = 'Are you sure you want to delete this item?',
  className = 'text-red-600 hover:text-red-700 transition'
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (confirm(confirmMessage)) {
      startTransition(async () => {
        await action()
      })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
      title="Delete"
    >
      <Trash2 className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
    </button>
  )
}
