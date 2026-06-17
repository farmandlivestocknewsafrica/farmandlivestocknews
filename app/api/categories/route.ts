import { NextResponse } from 'next/server'

// Single source of truth for navigation categories
// Maps to article category enum values used in the database
const NAVIGATION_CATEGORIES = [
  {
    id: 'agribusiness',
    name: 'Agribusiness',
    slug: 'agribusiness-investment',
    key: 'agribusiness'
  },
  {
    id: 'crop_production',
    name: 'Crop Production',
    slug: 'crop-production',
    key: 'crop_production'
  },
  {
    id: 'livestock_farming',
    name: 'Livestock Farming',
    slug: 'livestock-farming',
    key: 'livestock_farming'
  },
  {
    id: 'technology_innovation',
    name: 'Technology & Innovation',
    slug: 'agritech-innovation',
    key: 'technology_innovation'
  },
  {
    id: 'equipment_mechanisation',
    name: 'Equipment & Mechanization',
    slug: 'equipment-mechanization',
    key: 'equipment_mechanisation'
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    slug: 'inputs-nutrition',
    key: 'nutrition'
  },
  {
    id: 'policy_regulations',
    name: 'Policy & Regulations',
    slug: 'policy-regulations',
    key: 'policy_regulations'
  },
  {
    id: 'veterinary_protection',
    name: 'Veterinary & Protection',
    slug: 'veterinary-protection',
    key: 'veterinary_protection'
  }
]

export async function GET() {
  return NextResponse.json({
    categories: NAVIGATION_CATEGORIES
  })
}