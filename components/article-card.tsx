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
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(published_at))

  if (variant === 'list') {
    return (
      <Link href={`/articles/${slug}`}>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 hover:bg-muted transition rounded-lg group">
          {featured_image_url && (
            <div className="w-full sm:w-48 h-40 sm:h-32 flex-shrink-0 bg-muted rounded overflow-hidden">
              <Image
                src={featured_image_url}
                alt={title}
                width={192}
                height={128}
                className="w-full h-full object-cover group-hover:scale-105 transition"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary uppercase mb-1.5">{category}</p>
            <h3 className="font-serif font-bold text-base sm:text-lg text-gray-darker line-clamp-2 group-hover:text-primary transition mb-2">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mt-1.5">{excerpt}</p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{author} • {formattedDate}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${slug}`} className="block h-full w-full">
      <div 
        className="group overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition animate-fade-in-up h-full w-full flex flex-col"
        style={{ animationDelay: `${animationDelay * 100}ms` }}
      >
        {featured_image_url ? (
          <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden flex-shrink-0">
            <Image
              src={featured_image_url}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/10 flex-shrink-0 flex items-center justify-center">
            <span className="text-primary/30 font-serif text-4xl font-bold">
              {category.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
          <p className="text-xs font-semibold text-primary uppercase mb-1.5 truncate">{category}</p>
          <h3 className="font-serif font-bold text-sm sm:text-base text-gray-darker line-clamp-2 group-hover:text-primary transition mb-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{excerpt}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-auto truncate">{author} • {formattedDate}</p>
        </div>
      </div>
    </Link>
  )
}