
import { SiteShell } from '@/components/site-shell'
import { PaginatedArticles } from '@/components/infinite-articles'
import { AdPlacement, MobileInlineAd } from '@/components/ad-placement'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

const SLUG_TO_KEY: Record<string, string> = {
  'agribusiness-investment': 'agribusiness',
  agribusiness: 'agribusiness',

  'crop-production': 'crop_production',
  crops: 'crop_production',

  'livestock-farming': 'livestock_farming',
  livestock: 'livestock_farming',

  'agritech-innovation': 'technology_innovation',
  'technology-innovation': 'technology_innovation',
  tech: 'technology_innovation',

  'equipment-mechanization': 'equipment_mechanisation',
  'equipment-mechanisation': 'equipment_mechanisation',

  'inputs-nutrition': 'nutrition',
  nutrition: 'nutrition',

  'policy-regulations': 'policy_regulations',
  policy: 'policy_regulations',

  'veterinary-protection': 'veterinary_protection',
  veterinary: 'veterinary_protection',
}

const KEY_TO_NAME: Record<string, string> = {
  agribusiness: 'Agribusiness',
  crop_production: 'Crop Production',
  livestock_farming: 'Livestock Farming',
  technology_innovation: 'Technology & Innovation',
  equipment_mechanisation: 'Equipment & Mechanization',
  nutrition: 'Nutrition',
  policy_regulations: 'Policy & Regulations',
  veterinary_protection: 'Veterinary & Protection',
}

const KEY_TO_DESCRIPTION: Record<string, string> = {
  agribusiness: 'agribusiness and investment',
  crop_production: 'crop production',
  livestock_farming: 'livestock farming',
  technology_innovation: 'agritech and innovation',
  equipment_mechanisation: 'equipment and mechanization',
  nutrition: 'inputs and nutrition',
  policy_regulations: 'policy and regulations',
  veterinary_protection: 'veterinary and animal health',
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: categorySlug } = await params
  const categoryKey = SLUG_TO_KEY[categorySlug]

  if (!categoryKey) {
    notFound()
  }

  const categoryName = KEY_TO_NAME[categoryKey]
  const description = KEY_TO_DESCRIPTION[categoryKey]

  return (
    <SiteShell>
      <div className="w-full py-3 flex justify-center bg-muted/20">
        <AdPlacement
          slug="HOME_LEADERBOARD_PRIMARY"
          variant="leaderboard"
        />
      </div>

      <div className="py-8">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-primary" />
            <span className="text-sm font-semibold text-primary uppercase">
              Category
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            {categoryName}{' '}
            <span className="text-foreground">NEWS &amp; INSIGHTS</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl">
            Latest articles and insights about {description} in Africa.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary mb-6">
            All {categoryName} Articles
          </h2>

          <PaginatedArticles
            key={categoryKey}
            category={categoryKey}
            limit={20}
          />
        </div>
      </div>

      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="IN_CONTENT_NATIVE" variant="native" />
      </div>

      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="BOTTOM_LEADERBOARD" variant="leaderboard" />
      </div>

      <div className="w-full py-3 flex justify-center">
        <AdPlacement slug="BOTTOM_ROTATOR" variant="leaderboard" />
      </div>

      <MobileInlineAd />
    </SiteShell>
  )
}
