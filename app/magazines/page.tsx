import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, FileText, Download } from 'lucide-react'

async function getMagazines() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .order('publication_date', { ascending: false })

    if (error) {
      console.error('Error fetching magazines:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return []
  }
}

export default async function MagazinesPage() {
  const magazines = await getMagazines()
  const latestMagazine = magazines[0]
  const archiveMagazines = magazines.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="font-serif text-4xl font-bold text-primary mb-8">Magazine Archive</h1>

          {/* Latest Issue Featured Card */}
          {latestMagazine && (
            <div className="mb-12">
              <h2 className="text-lg font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Latest Issue</h2>
              <Link 
                href={`/magazines/${latestMagazine.id}`}
                className="block bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition group"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cover Image */}
                  <div className="relative h-80 md:h-96 bg-muted">
                    {latestMagazine.cover_image_url ? (
                      <Image
                        src={latestMagazine.cover_image_url}
                        alt={latestMagazine.title}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-6 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-orange-accent uppercase mb-2">Latest Issue</span>
                    <h3 className="font-serif text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition">
                      {latestMagazine.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(latestMagazine.publication_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {latestMagazine.issue_number && (
                        <span>Issue #{latestMagazine.issue_number}</span>
                      )}
                    </div>
                    {latestMagazine.description && (
                      <p className="text-muted-foreground line-clamp-3 mb-6">
                        {latestMagazine.description}
                      </p>
                    )}
                    <div className="flex gap-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                        Read Now
                      </span>
                      {latestMagazine.pdf_url && latestMagazine.available_for_download && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg font-semibold">
                          <Download className="w-4 h-4" />
                          Download
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Archive Grid */}
          {archiveMagazines.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Previous Issues</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {archiveMagazines.map((magazine) => (
                  <Link
                    key={magazine.id}
                    href={`/magazines/${magazine.id}`}
                    className="block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition group"
                  >
                    {/* Cover Image */}
                    <div className="relative h-48 bg-muted">
                      {magazine.cover_image_url ? (
                        <Image
                          src={magazine.cover_image_url}
                          alt={magazine.title}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-2 mb-2">
                        {magazine.title}
                      </h3>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {magazine.issue_number && (
                          <p>Issue #{magazine.issue_number}</p>
                        )}
                        <p>
                          {new Date(magazine.publication_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {magazines.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No Magazines Yet</h3>
              <p className="text-muted-foreground">Check back soon for our latest publications.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
