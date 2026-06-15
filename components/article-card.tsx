'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  id: string
  title: string
  slug: string
  excerpt?: string
  featured_image_url?: string
  author: string
  published_at: string
  category: string
  variant?: 'grid' | 'list'
  animationDelay?: number
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  featured_image_url,
  author,
  published_at,
  category,
  variant = 'grid',
  animationDelay = 0
}: ArticleCardProps) {
  // Parse date as UTC to avoid hydration mismatch from timezone differences
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(published_at))

  if (variant === 'list') {
    return (
      <Link href={`/articles/${slug}`}>
        <div className="flex gap-6 p-6 hover:bg-muted transition rounded-lg group">
          {featured_image_url && (
            <div className="w-48 h-32 flex-shrink-0 bg-muted rounded overflow-hidden">
              <Image
                src={featured_image_url}
                alt={title}
                width={192}
                height={128}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary uppercase mb-2">{category}</p>
            <h3 className="font-serif font-bold text-lg text-gray-darker line-clamp-2 group-hover:text-primary transition mb-2">
              {title}
            </h3>
            <p className="text-base text-muted-foreground line-clamp-2 mt-2">{excerpt}</p>
            <p className="text-sm text-muted-foreground mt-3">{author} • {formattedDate}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${slug}`}>
      <div 
        className="group overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition animate-fade-in-up"
        style={{ animationDelay: `${animationDelay * 100}ms` }}
      >
        {featured_image_url && (
          <div className="relative w-full h-64 bg-muted overflow-hidden">
            <Image
              src={featured_image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition"
            />
          </div>
        )}
        <div className="p-6">
          <p className="text-xs font-semibold text-primary uppercase mb-2">{category}</p>
          <h3 className="font-serif font-bold text-lg text-gray-darker line-clamp-2 group-hover:text-primary transition mb-3">
            {title}
          </h3>
          <p className="text-base text-muted-foreground line-clamp-2 mb-4">{excerpt}</p>
          <p className="text-sm text-muted-foreground">{author} • {formattedDate}</p>
        </div>
      </div>
    </Link>
  )
}
