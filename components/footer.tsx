'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Mail, CheckCircle, ArrowRight } from 'lucide-react'

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
    <footer className="mt-16">
      {/* Newsletter Section - White background */}
      <div className="w-full py-14 md:py-16 bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2d5016]/10 mb-5">
            <Mail className="w-7 h-7 text-[#2d5016]" />
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Stay Informed with Agriculture News
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Get the latest agriculture news, expert insights, and market trends delivered straight to your inbox every week.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 bg-[#2d5016]/5 rounded-xl">
              <CheckCircle className="w-6 h-6 text-[#2d5016] flex-shrink-0" />
              <p className="text-[#2d5016] font-medium">
                You're subscribed! Check your inbox for the latest updates.
              </p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
              <div className="relative flex-1 group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2d5016]/60 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 text-gray-900 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d5016]/30 focus:border-[#2d5016] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#2d5016] text-white rounded-xl font-semibold text-sm hover:bg-[#3a6b1e] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] shadow-lg shadow-black/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400 mt-5">
            No spam, ever. Unsubscribe anytime. We respect your inbox and your privacy.
          </p>
        </div>
      </div>

      {/* Separator line */}
      <div className="h-[1px] bg-white/10" />

      {/* Main Footer Content */}
      <div className="bg-[#2d5016]">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
            {/* Logo & Company Info */}
            <div className="md:col-span-1">
              <div className="bg-white/10 rounded-xl p-4 mb-5 w-fit">
                <Image
                  src="/logo.png"
                  alt="Farm & Livestock News Africa"
                  width={180}
                  height={80}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-sm text-white/75 mb-4 leading-relaxed">
                Independent agriculture reporting for farmers, agribusinesses and policy makers across Africa.
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                <strong className="text-white/80">Address:</strong><br />
                City SDA Plot Number 8481, Off Lumumbashi Road, Lusaka, Zambia
              </p>
            </div>

            {/* Quick Sections */}
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-white/90">Sections</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/livestock-farming" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Livestock Farming</Link></li>
                <li><Link href="/crop-production" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Crop Production</Link></li>
                <li><Link href="/agribusiness-investment" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Agribusiness</Link></li>
                <li><Link href="/agritech-innovation" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Agritech & Innovation</Link></li>
              </ul>
            </div>

            {/* More Sections */}
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-white/90">More</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/inputs-nutrition" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Inputs & Nutrition</Link></li>
                <li><Link href="/veterinary-protection" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Veterinary & Protection</Link></li>
                <li><Link href="/policy-regulations" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Policy & Regulations</Link></li>
                <li><Link href="/admin/login" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">Staff Portal</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-5 text-sm uppercase tracking-wider text-white/90">Contact</h4>
              <div className="text-sm space-y-4">
                <p>
                  <strong className="text-white/80">Admin:</strong><br />
                  <a href="mailto:admin@farmandlivestocknews.africa" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">
                    admin@farmandlivestocknews.africa
                  </a>
                </p>
                <p>
                  <strong className="text-white/80">Finance:</strong><br />
                  <a href="mailto:finance@farmandlivestocknews.africa" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">
                    finance@farmandlivestocknews.africa
                  </a>
                </p>
                <p>
                  <strong className="text-white/80">WhatsApp:</strong><br />
                  <a href="https://wa.me/260974723172" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#e8a04a] transition-colors duration-200">
                    +260 974 723 172
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© 2026 Farm & Livestock News Africa. All rights reserved.</p>
            <p className="text-xs text-white/50">Designed by Joshua Muhali &mdash; 0974399695</p>
          </div>
        </div>
      </div>
    </footer>
  )
}