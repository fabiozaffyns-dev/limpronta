import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductCard } from '@/components/ProductCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { brandItemListLd, breadcrumbLd } from '@/lib/json-ld'
import { firstSentence } from '@/lib/lexical'
import { getAllSlugs, getBrandBySlug, getProductsByBrand, getSettings } from '@/lib/queries'
import { jsonLdSafe, safeHref } from '@/lib/sanitize'
import { brandInquiryMessage } from '@/lib/whatsapp'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 120

// Prerender al build tutti i marchi (pochi): niente cold start Neon sul primo
// visitatore. dynamicParams resta true per gli slug aggiunti dopo il deploy.
export async function generateStaticParams() {
  const brands = await getAllSlugs('brands')
  return brands.filter((b) => b.slug).map((b) => ({ slug: b.slug as string }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Marchio non trovato' }
  // Description variabile: prima frase della scheda brand (dal CMS) se c'è,
  // così ogni marchio ha una description propria e non clonata.
  const descr =
    firstSentence(brand.descrizione) ||
    `Capi ${brand.nome} uomo selezionati da L'Impronta, Orbassano: qualità e disponibilità in negozio.`
  return {
    title: `${brand.nome} uomo`,
    description: descr,
    alternates: { canonical: `/marchi/${brand.slug}` },
  }
}

export default async function BrandPage({ params }: Params) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const [products, settings] = await Promise.all([getProductsByBrand(brand.id), getSettings()])
  const sito = safeHref(brand.sito)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafe(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Marchi', path: '/marchi' },
              { name: brand.nome, path: `/marchi/${brand.slug}` },
            ]),
          ),
        }}
      />
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(brandItemListLd(brand, products)) }}
        />
      )}

      <header className="shell pt-36 pb-10 md:pt-44">
        <Eyebrow>
          <Link href="/marchi" className="link-segno">
            Marchi
          </Link>
        </Eyebrow>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-none">{brand.nome}</h1>
        {sito && (
          <a
            href={sito}
            target="_blank"
            rel="noopener noreferrer"
            className="cartellino link-segno mt-6 inline-block text-ottone-testo"
          >
            Sito ufficiale ↗
          </a>
        )}
      </header>

      {/* Box "Il marchio": la descrizione testuale del brand (dal CMS). */}
      <section className="shell pb-8 md:pb-12">
        <hr className="filetto" />
        <div className="mt-10 grid gap-4 md:grid-cols-[0.32fr_0.68fr] md:gap-12">
          <Eyebrow>Il marchio</Eyebrow>
          <div className="max-w-2xl">
            {brand.descrizione ? (
              <RichText
                data={brand.descrizione}
                className="text-lg leading-relaxed text-pietra-scura md:text-xl"
              />
            ) : (
              <p className="text-lg leading-relaxed text-pietra-scura md:text-xl">
                {brand.nome} fa parte della selezione de L&rsquo;Impronta. Passa in negozio a Orbassano
                per scoprirne i capi, oppure scrivici per informazioni e disponibilità.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="shell pb-24">
        <hr className="filetto mb-10" />
        {products.length === 0 ? (
          <p className="py-6 text-pietra-scura">
            Al momento non ci sono capi a catalogo per questo marchio. Scrivici per disponibilità e
            novità.
          </p>
        ) : (
          <>
            <Eyebrow className="mb-8">
              In negozio · {products.length} {products.length === 1 ? 'capo' : 'capi'}
            </Eyebrow>
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA: anche con prodotti a catalogo, un modo per chiedere disponibilità
         e novità del marchio senza dover entrare in una scheda. */}
      <section className="shell pb-28">
        <div
          className="flex flex-col items-start gap-6 border p-8 md:flex-row md:items-center md:justify-between md:p-10"
          style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 40%, transparent)' }}
        >
          <div>
            <Eyebrow>Interessato a {brand.nome}?</Eyebrow>
            <p className="font-display mt-3 max-w-md text-2xl leading-snug">
              Chiedici disponibilità, taglie e novità in arrivo.
            </p>
          </div>
          <WhatsAppButton
            number={settings.whatsappNumber}
            message={brandInquiryMessage(brand.nome)}
            label="Scrivici su WhatsApp"
          />
        </div>
      </section>
    </>
  )
}
