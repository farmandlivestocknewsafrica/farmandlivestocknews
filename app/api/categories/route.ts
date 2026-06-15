import { NextResponse } from 'next/server'

// Hardcoded navigation categories with strict control
// Maps to article category enum: crop_production, livestock_farming, technology_innovation, equipment_mechanisation, nutrition, agribusiness
const NAVIGATION_CATEGORIES = [
  {
    id: 'agribusiness',
    name: 'Agribusiness',
    slug: 'agribusiness',
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
    slug: 'technology-innovation',
    key: 'technology_innovation'
  },
  {
    id: 'equipment_mechanisation',
    name: 'Equipment & Mechanisation',
    slug: 'equipment-mechanisation',
    key: 'equipment_mechanisation'
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    slug: 'nutrition',
    key: 'nutrition'
  }
]

export async function GET() {
  return NextResponse.json({
    categories: NAVIGATION_CATEGORIES
  })
}
