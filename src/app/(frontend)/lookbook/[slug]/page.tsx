import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { cn } from '@/lib/cn'
import { formatStagioneEstesa } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { getLookbookBySlug } from '@/lib/queries'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const lb = await getLookbookBySlug(slug)
  if (!lb) return { title: 'Lookbook non trovato' }
  const cover = mediaUrl(lb.immagini?.[0])
  return {
    title: lb.titolo,
    description: `Lookbook ${lb.titolo} — L'Impronta, Orbassano.`,
    openGraph: { title: lb.titolo, images: cover ? [cover] : undefined },
  }
}

export default async function LookbookPage({ params }: Params) {
  const { slug } = await params
  const lb = await getLookbookBySlug(slug)
  if (!lb) notFound()

  const stagione = formatStagioneEstesa(lb.stagione)
  const images = lb.immagini ?? []

  return (
    <article className="pt-36 md:pt-44">
      <header className="shell">
        <Eyebrow>
          <Link href="/lookbook" className="link-segno">
            Lookbook
          </Link>
        </Eyebrow>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-none">{lb.titolo}</h1>
        {stagione && <p className="cartellino mt-4 text-pietra-scura">{stagione}</p>}
        {lb.descrizione && <RichText data={lb.descrizione} className="mt-8" />}
        <hr className="filetto mt-12" />
      </header>

      <section className="shell pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {images.map((img, i) => {
            // Ritmo editoriale: la prima immagine e ogni quinta occupano l'intera larghezza.
            const wide = i === 0 || i % 5 === 4
            return (
              <div key={i} className={cn(wide && 'sm:col-span-2')}>
                <CloudinaryImage
                  media={img}
                  alt={`${lb.titolo} — ${i + 1}`}
                  aspect={wide ? '16 / 9' : '4 / 5'}
                  sizes={wide ? '100vw' : '(max-width: 640px) 100vw, 50vw'}
                  priority={i === 0}
                />
              </div>
            )
          })}
        </div>
      </section>
    </article>
  )
}
