'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to subscribe')
      }

      setEmail('')
      setIsSubscribed(true)
      toast.success('Welcome aboard! 🎉', {
        description: 'Thank you for subscribing to our agriculture newsletter.',
        duration: 5000,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast.error('Subscription failed', {
        description: message,
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      {/* Newsletter Signup - Modernized */}
      <div className="w-full py-16 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <Mail className="w-6 h-6 text-green-700" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-black mb-3">
            Stay Informed with Agriculture News
          </h3>
          <p className="text-sm md:text-base text-green-800/80 mb-8 max-w-lg mx-auto">
            Get the latest agriculture news, expert insights, and market trends delivered straight to your inbox every week.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-green-900 font-medium">
                You're subscribed! Check your inbox for the latest updates.
              </p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600/40" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3 py-3 bg-white border border-green-200 text-green-900 rounded-xl text-sm placeholder-green-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}

          <p className="text-xs text-green-800/60 mt-4">
            No spam, ever. Unsubscribe anytime. We respect your inbox and your privacy.
          </p>
        </div>
      </div>

      {/* Footer Advertisement Leaderboard */}
      <div className="w-full bg-muted/30 py-2 flex justify-center border-b border-primary-foreground/20">
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Company Info */}
          <div>
            <div className="bg-white rounded-lg p-3 mb-4 w-fit">
              <Image 
                src="/logo.png" 
                alt="Farm & Livestock News Africa" 
                width={180} 
                height={80}
                className="h-14 w-auto"
              />
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">Independent agriculture reporting for farmers, agribusinesses and policy makers across Africa.</p>
            <p className="text-xs text-primary-foreground/70">
              <strong>Address:</strong><br />
              City SDA Plot Number 8481, Off Lumumbashi Road, Lusaka, Zambia
            </p>
          </div>

          {/* Quick Sections */}
          <div>
            <h4 className="font-bold mb-4 text-base uppercase">SECTIONS</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/livestock-farming" className="hover:text-orange-accent transition">Livestock Farming</Link></li>
              <li><Link href="/crop-production" className="hover:text-orange-accent transition">Crop Production</Link></li>
              <li><Link href="/agribusiness-investment" className="hover:text-orange-accent transition">Agribusiness</Link></li>
              <li><Link href="/agritech-innovation" className="hover:text-orange-accent transition">Agritech & Innovation</Link></li>
            </ul>
          </div>

          {/* More Sections */}
          <div>
            <h4 className="font-bold mb-4 text-base uppercase">MORE</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/inputs-nutrition" className="hover:text-orange-accent transition">Inputs & Nutrition</Link></li>
              <li><Link href="/veterinary-protection" className="hover:text-orange-accent transition">Veterinary & Protection</Link></li>
              <li><Link href="/policy-regulations" className="hover:text-orange-accent transition">Policy & Regulations</Link></li>
              <li><Link href="/admin/login" className="hover:text-orange-accent transition">Staff Portal</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-base uppercase">CONTACT</h4>
            <div className="text-sm space-y-3">
              <p>
                <strong>Admin:</strong><br />
                <a href="mailto:admin@farmandlivestocknews.africa" className="hover:text-orange-accent transition">
                  admin@farmandlivestocknews.africa
                </a>
              </p>
              <p>
                <strong>Finance:</strong><br />
                <a href="mailto:finance@farmandlivestocknews.africa" className="hover:text-orange-accent transition">
                  finance@farmandlivestocknews.africa
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong><br />
                <a href="https://wa.me/260974723172" target="_blank" rel="noopener noreferrer" className="hover:text-orange-accent transition">
                  +260 974 723 172
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/70">
          <p>© 2026 Farm & Livestock News Africa. All rights reserved.</p>
          <p className="text-xs text-primary-foreground/60 mt-2">Designed by Joshua Muhali - 0974399695</p>
        </div>
      </div>
    </footer>
  )
}
