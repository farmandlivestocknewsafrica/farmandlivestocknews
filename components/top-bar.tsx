import Link from 'next/link'
import { Twitter, Facebook, Instagram, MessageCircle } from 'lucide-react'
import { UserMenu } from './user-menu'
import { MediaKitDownloader } from './media-kit-downloader'

export async function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-full mx-auto flex justify-between items-center">
        <div className="flex gap-4">
          <Link href="/magazines" className="hover:underline font-semibold">
            Latest Magazine Issue
          </Link>
          <MediaKitDownloader />
        </div>

        {/* Right side: Social icons, WhatsApp, and user menu */}
        <div className="flex gap-3 items-center">
          <a
            href="https://x.com/farmandlivestoc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
            aria-label="Follow us on X"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href="https://web.facebook.com/profile.php?id=61590311094103"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
            aria-label="Follow us on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://www.instagram.com/farmandlivestocknewsafrica"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
            aria-label="Follow us on Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me/260974723172"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition"
            aria-label="Contact us on WhatsApp"
            title="WhatsApp: +260 974 723 172"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <span className="text-primary-foreground/40">|</span>
          <UserMenu />
        </div>
      </div>
    </div>
  )
}
