'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Filter, X, AlertCircle, CheckCircle, ImageIcon, Calendar, LinkIcon } from 'lucide-react'
import type { AdCampaign } from '@/lib/types/ads'
import { AD_SLOTS, ALLOWED_AD_FORMATS } from '@/lib/ads/constants'
import { ImageUpload } from '@/components/image-upload'

const SLOT_GROUPS = {
  'Homepage': [
    'TOP_LEADERBOARD',
    'HOME_TOP_ROTATING_1',
    'HOME_TOP_ROTATING_2',
    'LEFT_SIDE_BANNER_1',
    'LEFT_SIDE_BANNER_2',
    'LEFT_SIDE_BANNER_3',
    'RIGHT_SIDE_BANNER_1',
    'RIGHT_SIDE_BANNER_2',
    'RIGHT_SIDE_BANNER_3',
    'IN_CONTENT_NATIVE',
    'BOTTOM_LEADERBOARD',
    'BOTTOM_HOME_ROTATING'
  ],
  'Article Pages': ['ARTICLE_TOP', 'ARTICLE_MIDDLE', 'ARTICLE_BOTTOM'],
  'Mobile': ['MOBILE_HEADER', 'MOBILE_STICKY', 'MOBILE_INLINE'],
}

type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  id: string
  type: NotificationType
  message: string
}

const FormSection = ({ icon: Icon, title, children }: any) => (
  <section className="bg-white rounded-lg p-5 border border-border">
    <h3 className="font-semibold mb-4 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      <div className="w-1 h-6 bg-primary rounded-full"></div>
      {title}
    </h3>
    {children}
  </section>
)

export function AdCampaignManager() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [campaignPlacements, setCampaignPlacements] = useState<Record<string, string[]>>({})
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    advertiser_name: '', 
    advertiser_url: '',
    image_url: '', 
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    is_active: true,
  })
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => setNotifications(prev => prev.slice(1)), 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  const addNotification = (type: NotificationType, message: string) => {
    setNotifications(prev => [...prev, { id: Math.random().toString(36), type, message }])
  }

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/ad-campaigns')
      if (!res.ok) throw new Error('Failed to fetch campaigns')
      const data = await res.json()
      
      const placements: Record<string, string[]> = {}
      for (const campaign of data.campaigns || []) {
        placements[campaign.id] = (campaign.ad_placements || []).map((p: any) => p.slot_slug)
      }
      setCampaignPlacements(placements)
      setCampaigns(data.campaigns || [])
      addNotification('success', 'Campaigns loaded successfully')
    } catch (err) {
      console.error('[v0] Error fetching campaigns:', err)
      addNotification('error', 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' ? true : filterStatus === 'active' ? campaign.is_active : !campaign.is_active
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.advertiser_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedSlots.length === 0) {
      addNotification('error', 'Please select at least one slot for this campaign')
      return
    }

    try {
      const url = editingId ? `/api/admin/ad-campaigns/${editingId}` : '/api/admin/ad-campaigns'
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slots: selectedSlots }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        const message = errorData.error || 'Server error'
        const hint = errorData.hint ? ` (${errorData.hint})` : ''
        throw new Error(message + hint)
      }
      
      await fetchCampaigns()
      setShowForm(false)
      setEditingId(null)
      resetForm()
      addNotification('success', `Campaign ${editingId ? 'updated' : 'created'} successfully`)
    } catch (err) {
      addNotification('error', `Failed to save campaign: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete campaign "${title}"? This action cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/ad-campaigns/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete campaign')
      await fetchCampaigns()
      addNotification('success', 'Campaign deleted successfully')
    } catch (err) {
      addNotification('error', 'Failed to delete campaign')
    }
  }

  const resetForm = () => {
    const today = new Date()
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(today.getMonth() + 1)
    
    setFormData({ 
      title: '', 
      description: '', 
      advertiser_name: '', 
      advertiser_url: '', 
      image_url: '', 
      start_date: today.toISOString().split('T')[0], 
      end_date: oneMonthLater.toISOString().split('T')[0], 
      is_active: true 
    })
    setSelectedSlots([])
    setImageError(null)
  }

  const handleEdit = (campaign: AdCampaign) => {
    setFormData({
      title: campaign.title, description: campaign.description || '', advertiser_name: campaign.advertiser_name,
      advertiser_url: campaign.advertiser_url || '', image_url: campaign.image_url,
      start_date: campaign.start_date.split('T')[0], end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '', is_active: campaign.is_active,
    })
    setSelectedSlots(campaignPlacements[campaign.id] || [])
    setEditingId(campaign.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot])
  }

  const toggleSlotGroup = (group: string[]) => {
    const allSelected = group.every(slot => selectedSlots.includes(slot))
    setSelectedSlots(prev => allSelected ? prev.filter(s => !group.includes(s)) : [...new Set([...prev, ...group])])
  }

  if (loading) return (
    <div className="flex items-center justify-center py-12 p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading campaigns...</p>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div key={notif.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 ${
            notif.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notif.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            {notif.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {notif.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{notif.message}</span>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-lg p-6 animate-in fade-in space-y-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{editingId ? '✏️ Edit Campaign' : '✨ New Campaign'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm() }} className="p-1 hover:bg-black/5 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Basic Info */}
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="e.g., Summer Promotion 2026" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition" required />
              <input type="text" placeholder="Company name" value={formData.advertiser_name} onChange={e => setFormData({ ...formData, advertiser_name: e.target.value })} className="border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition" required />
            </div>
            <input type="url" placeholder="https://example.com" value={formData.advertiser_url} onChange={e => setFormData({ ...formData, advertiser_url: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition mb-4" />
            <textarea placeholder="Campaign details, targeting info, etc." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition" rows={3} />
          </FormSection>

          {/* Image Upload */}
          <FormSection icon={ImageIcon} title="Campaign Image">
            <ImageUpload bucket="ads" value={formData.image_url} onChange={(url) => { setFormData({ ...formData, image_url: url || '' }); setImageError(null) }} label="Upload Campaign Image" maxSizeMB={2} helpText={`Required. ${ALLOWED_AD_FORMATS.display}`} />
            {imageError && <p className="text-red-500 text-sm mt-2">⚠️ {imageError}</p>}
            {formData.image_url && <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800 text-sm"><CheckCircle className="w-4 h-4" /> Image uploaded successfully</div>}
          </FormSection>

          {/* Schedule */}
          <FormSection icon={Calendar} title="Campaign Schedule">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition" required />
              <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 outline-none transition" required />
            </div>
          </FormSection>

          {/* Slots */}
          <section className="bg-white rounded-lg p-5 border border-border">
            <h3 className="font-semibold mb-4">Select Ad Slots ({selectedSlots.length} selected)</h3>
            <div className="space-y-4">
              {Object.entries(SLOT_GROUPS).map(([groupName, slots]) => {
                const groupSelected = slots.every(slot => selectedSlots.includes(slot))
                const selectedCount = slots.filter(s => selectedSlots.includes(s)).length
                return (
                  <div key={groupName} className="border border-border/50 rounded-lg p-4 hover:border-primary/30 transition">
                    <label className="flex items-center gap-3 font-medium mb-3 cursor-pointer p-2 hover:bg-muted rounded transition">
                      <input type="checkbox" checked={groupSelected} onChange={() => toggleSlotGroup(slots)} className="w-5 h-5 rounded cursor-pointer" />
                      <span>{groupName}</span>
                      <span className="ml-auto text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">{selectedCount}/{slots.length}</span>
                    </label>
                    <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {slots.map(slot => (
                        <label key={slot} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded text-sm transition">
                          <input type="checkbox" checked={selectedSlots.includes(slot)} onChange={() => toggleSlot(slot)} className="w-4 h-4 rounded cursor-pointer" />
                          <span className="font-medium text-foreground">{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            {selectedSlots.length === 0 && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800 text-sm"><AlertCircle className="w-4 h-4" /> You must select at least one slot</div>}
          </section>

          {/* Actions */}
          <section className="bg-white rounded-lg p-5 border border-border flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 rounded cursor-pointer" />
              <span className="font-medium">Activate Campaign</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition">
                {editingId ? '💾 Update' : '✨ Create'} Campaign
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm() }} className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition">
                Cancel
              </button>
            </div>
          </section>
        </form>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaigns</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage {filteredCampaigns.length} of {campaigns.length} campaigns</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            New Campaign
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search campaigns, advertisers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(status => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
              <Filter className="w-4 h-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground">No campaigns found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign, idx) => (
            <div key={campaign.id} className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition animate-in fade-in duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {campaign.image_url && (
                  <img src={campaign.image_url} alt={campaign.title} className="w-full h-28 object-cover rounded-lg border border-border md:col-span-1" />
                )}
                
                <div className={campaign.image_url ? 'md:col-span-2' : 'md:col-span-3'}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <LinkIcon className="w-3 h-3" /> {campaign.advertiser_name}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${campaign.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {campaign.is_active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                      {campaign.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {campaign.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{campaign.description}</p>}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(campaign.start_date).toLocaleDateString()} → {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : '∞'}
                  </p>
                </div>

                <div className="md:col-span-1 flex md:flex-col gap-2">
                  <button onClick={() => handleEdit(campaign)} className="flex-1 flex items-center justify-center gap-2 p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition font-medium text-sm">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(campaign.id, campaign.title)} className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100/50 hover:bg-red-100 text-red-600 rounded-lg transition font-medium text-sm">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {campaignPlacements[campaign.id]?.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Slots ({campaignPlacements[campaign.id].length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {campaignPlacements[campaign.id].map(slot => (
                      <span key={slot} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium hover:bg-primary/20 transition">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
