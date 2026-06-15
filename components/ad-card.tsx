'use client'

interface AdCardProps {
  title?: string
  description?: string
  cta?: string
}

/**
 * Ad Card Component - Visually distinct from content cards
 * 
 * Design rules:
 * - Different background tone (muted background with border emphasis)
 * - "Sponsored" label badge (required)
 * - Increased padding for visual breathing room
 * - Border-left accent color for visual distinction
 */
export function AdCard({
  title = 'Featured Opportunity',
  description = 'Explore industry solutions and resources.',
  cta = 'Learn More'
}: AdCardProps) {
  return (
    <div className="rounded-lg bg-muted/50 border-l-4 border-orange-accent p-8 mb-6 not-prose">
      {/* Sponsored Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block px-3 py-2 bg-orange-accent/20 text-orange-accent text-xs font-bold uppercase rounded">
          Sponsored
        </span>
      </div>

      {/* Ad Content */}
      <h3 className="font-serif font-bold text-xl text-foreground mb-3">
        {title}
      </h3>
      <p className="text-base text-muted-foreground mb-5 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <button className="inline-block text-base font-semibold text-orange-accent hover:text-orange-accent/80 transition">
        {cta} →
      </button>
    </div>
  )
}
