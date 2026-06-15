'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Trash2, Plus, CheckCircle, Circle, Home, AlertCircle } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name?: string | null
  subscribed_at: string
  is_active: boolean
}

export default function SubscriptionsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSubscribers()
  }, [])

  async function fetchSubscribers() {
    setLoading(true)
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      setError('Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSubscriber(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newSubscriber.email) {
      setError('Email is required')
      return
    }

    try {
      const supabase = await createClient()

      // Check if email already exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', newSubscriber.email)
        .limit(1)

      if (existing && existing.length > 0) {
        setError('This email is already subscribed')
        return
      }

      // Add new subscription
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: newSubscriber.email,
          name: newSubscriber.name || null,
          subscribed_at: new Date().toISOString(),
          is_active: true
        }])

      if (insertError) throw insertError

      setSuccess('Subscriber added successfully')
      setNewSubscriber({ email: '', name: '' })
      setShowForm(false)
      fetchSubscribers()
    } catch (err) {
      console.error('Error adding subscriber:', err)
      setError(err instanceof Error ? err.message : 'Failed to add subscriber')
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchSubscribers()
    } catch (err) {
      console.error('Error updating subscription:', err)
      setError('Failed to update subscription')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this subscriber?')) return
    
    setDeleting(id)
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSubscribers()
      setSuccess('Subscriber removed')
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      setError('Failed to remove subscriber')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">Manage your mailing list and active audience</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
          <p className="text-3xl font-bold mt-1 text-primary">{subscribers.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active</p>
          <p className="text-3xl font-bold mt-1 text-green-600">
            {subscribers.filter(s => s.is_active).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">This Month</p>
          <p className="text-3xl font-bold mt-1 text-blue-600">
            {subscribers.filter(s => {
              const date = new Date(s.subscribed_at)
              const now = new Date()
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-100">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Add Subscriber Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-md animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-serif font-bold text-primary mb-4">Add New Subscriber</h2>
          <form onSubmit={handleAddSubscriber} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="subscriber@example.com"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Subscriber Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newSubscriber.name}
                  onChange={(e) => setNewSubscriber(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition"
              >
                Add Subscriber
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No subscribers yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Subscriber</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Join Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/50 transition group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(sub.id, sub.is_active)}
                        className="flex items-center gap-2 group/btn"
                        title={sub.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {sub.is_active ? (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground bg-muted px-2 py-1 rounded-full text-xs font-bold">
                            <Circle className="w-3 h-3" />
                            Inactive
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{sub.name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(sub.subscribed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={deleting === sub.id}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                        title="Remove subscriber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
