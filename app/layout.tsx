import type { Metadata } from 'next'
import { Lora, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/app/providers/AuthProvider'
import './globals.css'

const lora = Lora({ subsets: ["latin"], variable: '--font-lora' })
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Farm & Livestock News Africa',
  description: 'Independent agriculture reporting for farmers, agribusinesses and policy makers across Africa',
  generator: 'v0.app',
  verification:{
    google:"l6NgnJmY35HPVVm0q6oMsDrIaGKP4R1KzJAufGM2I4I",
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

