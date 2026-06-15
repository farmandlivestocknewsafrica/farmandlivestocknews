'use client'

import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      {/* Newsletter Signup */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-primary-foreground/20">
        <div className="max-w-md">
          <h3 className="font-serif text-xl font-bold text-primary-foreground mb-3">Subscribe to Our Newsletter</h3>
          <p className="text-sm text-primary-foreground/80 mb-4">Get the latest agriculture news delivered to your inbox.</p>
          <form className="flex gap-2" onSubmit={(e) => {
            e.preventDefault()
            const email = (e.target as HTMLFormElement).email.value
            if (email) {
              fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              }).then(() => {
                (e.target as HTMLFormElement).reset()
                alert('Thank you for subscribing!')
              }).catch(err => {
                console.error('Subscription error:', err)
                alert('Error subscribing. Please try again.')
              })
            }
          }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="flex-1 px-3 py-2 bg-white text-foreground rounded-lg text-sm placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-orange-accent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-accent text-white rounded-lg font-semibold text-sm hover:bg-orange-accent/90 transition"
            >
              Subscribe
            </button>
          </form>
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
          <p className="text-xs text-primary-foreground/60 mt-2">Designed by Joshua Muhali</p>
        </div>
      </div>
    </footer>
  )
}
