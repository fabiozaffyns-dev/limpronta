import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LookbookMosaic } from '@/components/LookbookMosaic'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { SwapLabel } from '@/components/ui/SwapLabel'
import { formatStagioneEstesa } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { getAllSlugs, getLookbookBySlug, getSettings } from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 120

// Prerender al build tutti i lookbook (pochi). dynamicParams true per i nuovi.
export async function generateStaticParams() {
  const lookbooks = await getAllSlugs('lookbooks')
  return lookbooks.filter((l) => l.slug).map((l) => ({ slug: l.slug as string }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const lb = await getLookbookBySlug(slug)
  if (!lb) return { title: 'Lookbook non trovato' }
  const cover = mediaUrl(lb.immagini?.[0])
  return {
    title: lb.titolo,
    description: `Lookbook ${lb.titolo} — L'Impronta, Orbassano.`,
    alternates: { canonical: `/lookbook/${lb.slug}` },
    openGraph: { title: lb.titolo, images: cover ? [cover] : undefined },
  }
}

export default async function LookbookPage({ params }: Params) {
  const { slug } = await params
  const [lb, settings] = await Promise.all([getLookbookBySlug(slug), getSettings()])
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

      <section className="shell pb-16">
        {/* Mosaico editoriale: righe a scale diverse (piena, coppia,
           grande+piccola, trittico) guidate dal formato reale delle foto e
           variate con un ritmo pseudo-casuale stabile per lookbook. */}
        <LookbookMosaic images={images} seed={slug} titolo={lb.titolo} />
      </section>

      {/* CTA di chiusura: il lookbook non e' piu' un vicolo cieco. Quando il
         desiderio e' al massimo, un passo successivo verso il negozio. */}
      <section className="bg-inchiostro text-avorio">
        <div className="shell py-20 text-center md:py-24">
          <Eyebrow scuro className="justify-center">
            Ti e&rsquo; piaciuto?
          </Eyebrow>
          <p className="font-display mx-auto mt-5 max-w-2xl text-3xl leading-tight text-avorio md:text-4xl">
            Vieni a vederlo dal vivo — provalo, tocca i tessuti, fatti consigliare.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <WhatsAppButton
              number={settings.whatsappNumber}
              message={appointmentMessage()}
              label="Prenota una visita"
              variant="ottone"
              className="w-full justify-center sm:w-auto"
            />
            <Link href="/catalogo" className="btn btn-ghost w-full justify-center text-avorio sm:w-auto" style={{ borderColor: 'color-mix(in srgb, var(--color-avorio) 40%, transparent)' }}>
              <SwapLabel>Sfoglia il catalogo</SwapLabel>
            </Link>
          </div>
        </div>
      </section>
    </article>
  )
}
