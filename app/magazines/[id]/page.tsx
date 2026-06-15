import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, FileText, Download, ArrowLeft, BookOpen } from 'lucide-react'

interface MagazinePageProps {
  params: Promise<{ id: string }>
}

async function getMagazine(id: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching magazine:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching magazine:', error)
    return null
  }
}

export default async function MagazineDetailPage({ params }: MagazinePageProps) {
  const { id } = await params
  const magazine = await getMagazine(id)

  if (!magazine) {
    notFound()
  }

  const formattedDate = new Date(magazine.publication_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Back Link */}
          <Link 
            href="/magazines" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Magazine Archive
          </Link>

          {/* Magazine Header */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden shadow-xl">
              {magazine.cover_image_url ? (
                <Image
                  src={magazine.cover_image_url}
                  alt={magazine.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-center">
              {magazine.issue_number && (
                <span className="text-sm font-semibold text-orange-accent uppercase mb-2">
                  Issue #{magazine.issue_number}
                </span>
              )}
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                {magazine.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                {magazine.pages_count && (
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {magazine.pages_count} pages
                  </span>
                )}
              </div>

              {magazine.description && (
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {magazine.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {magazine.pdf_url && magazine.available_for_download && (
                  <a
                    href={magazine.pdf_url}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </a>
                )}
                {magazine.pdf_url && (
                  <a
                    href={magazine.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition"
                  >
                    <FileText className="w-5 h-5" />
                    Open in New Tab
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* PDF Embed Viewer */}
          {magazine.pdf_url && (
            <div className="mb-12">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Read Online</h2>
              <div className="bg-muted rounded-lg overflow-hidden border border-border">
                <iframe
                  src={`${magazine.pdf_url}#toolbar=1&navpanes=0`}
                  className="w-full h-[800px]"
                  title={magazine.title}
                />
              </div>
              {/* Fallback for browsers that don't support PDF embed */}
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Having trouble viewing?{' '}
                <a 
                  href={magazine.pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open PDF directly
                </a>
              </p>
            </div>
          )}

          {/* No PDF Available */}
          {!magazine.pdf_url && (
            <div className="bg-muted rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">PDF Not Available</h3>
              <p className="text-muted-foreground">
                The digital version of this issue is not currently available for download.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
