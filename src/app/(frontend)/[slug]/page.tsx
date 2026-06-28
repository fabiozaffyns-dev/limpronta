import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { RichText } from '@/components/ui/RichText'
import { mediaUrl } from '@/lib/media'
import { getPageBySlug } from '@/lib/queries'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 120

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) return { title: 'Pagina non trovata' }
  return {
    title: page.titolo,
    description: page.sommario ?? undefined,
    openGraph: { title: page.titolo, images: mediaUrl(page.immagine) ? [mediaUrl(page.immagine)!] : undefined },
  }
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="pt-36 md:pt-44">
      <header className="shell">
        <h1 className="max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">{page.titolo}</h1>
        {page.sommario && <p className="mt-6 max-w-2xl text-xl text-pietra-scura">{page.sommario}</p>}
        <hr className="filetto mt-12" />
      </header>

      {mediaUrl(page.immagine) && (
        <div className="shell mt-12">
          <CloudinaryImage media={page.immagine} alt={page.titolo} aspect="16 / 9" sizes="100vw" priority />
        </div>
      )}

      <div className="shell py-16">
        <RichText data={page.contenuto} />
      </div>
    </article>
  )
}
