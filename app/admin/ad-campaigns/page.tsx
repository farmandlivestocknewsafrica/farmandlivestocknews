import Link from 'next/link'
import { ArrowLeft, Home, FileText, Settings, Megaphone } from 'lucide-react'
import { AdCampaignManager } from '@/components/admin/ad-campaign-manager'

export const metadata = {
  title: 'Ad Campaigns - Admin',
  description: 'Manage advertising campaigns and placements',
}

export default function AdminAdCampaignsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <Megaphone className="w-8 h-8" />
            Ad Campaigns
          </h1>
          <p className="text-muted-foreground">Manage your advertising inventory and placements</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Manager */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-1">
          <AdCampaignManager />
        </div>
      </div>
    </div>
  )
}
