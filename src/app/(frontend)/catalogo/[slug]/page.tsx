import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ContactForm } from '@/components/ContactForm'
import { ProductCard } from '@/components/ProductCard'
import { ProductGallery } from '@/components/ProductGallery'
import { ProductStickyCta } from '@/components/ProductStickyCta'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { Breathe } from '@/components/motion/Breathe'
import { cn } from '@/lib/cn'
import { formatPrice, formatStagioneEstesa } from '@/lib/format'
import { breadcrumbLd, productLd } from '@/lib/json-ld'
import { mediaUrl, rel } from '@/lib/media'
import { getFeaturedProducts, getProductBySlug, getRelatedProducts, getSettings } from '@/lib/queries'
import { jsonLdSafe } from '@/lib/sanitize'
import { productInquiryMessage } from '@/lib/whatsapp'
import type { Brand, Category } from '@/payload-types'

type Params = { params: Promise<{ slug: string }> }

export const revalidate = 120

// Prerender al build le schede dei prodotti in evidenza (i più visitati): il
// resto resta ISR on-demand (dynamicParams true), senza appesantire il build.
export async function generateStaticParams() {
  const featured = await getFeaturedProducts(12)
  return featured.filter((p) => p.slug).map((p) => ({ slug: p.slug as string }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Prodotto non trovato' }
  const brand = rel<Brand>(product.brand)
  const cover = mediaUrl(product.immagini?.[0])
  const prezzoMeta = formatPrice(product.prezzo, product.prezzoSuRichiesta)
  // Marca nel title: intercetta le ricerche "marca + capo", leva di ranking
  // principale per un multimarca.
  const titolo = brand?.nome ? `${brand.nome} ${product.nome}` : product.nome
  const descr = `${brand?.nome ? `${brand.nome} · ` : ''}${product.nome} — disponibile da L'Impronta, Orbassano.${prezzoMeta ? ` ${prezzoMeta}.` : ''}`
  return {
    title: titolo,
    description: descr,
    alternates: { canonical: `/catalogo/${product.slug}` },
    openGraph: { title: titolo, description: descr, images: cover ? [cover] : undefined },
  }
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product)])

  const brand = rel<Brand>(product.brand)
  const categoria = rel<Category>(product.categoria)
  const images = product.immagini ?? []
  const prezzo = formatPrice(product.prezzo, product.prezzoSuRichiesta)
  const stagione = formatStagioneEstesa(product.stagione)
  const oggetto = `${product.nome} — ${product.sku}`

  return (
    <article className="pt-28 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(productLd(product, settings)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSafe(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Catalogo', path: '/catalogo' },
              { name: product.nome, path: `/catalogo/${product.slug}` },
            ]),
          ),
        }}
      />

      <div className="shell">
        {/* breadcrumb */}
        <nav aria-label="Percorso" className="cartellino mb-8 flex flex-wrap gap-x-2 gap-y-1 text-pietra-scura">
          <Link href="/catalogo" className="link-segno">
            Catalogo
          </Link>
          <span aria-hidden>/</span>
          {categoria && (
            <>
              <Link href={`/catalogo?categoria=${categoria.slug}`} className="link-segno">
                {categoria.nome}
              </Link>
              <span aria-hidden>/</span>
            </>
          )}
          <span className="text-inchiostro">{product.nome}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery images={images} nome={product.nome} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            {brand?.nome && (
              <Eyebrow as="div">
                <Link href={`/marchi/${brand.slug}`} className="link-segno">
                  {brand.nome}
                </Link>
              </Eyebrow>
            )}
            <Breathe as="h1" className="mt-4 text-4xl uppercase leading-tight md:text-5xl">
              {product.nome}
            </Breathe>
            {prezzo && <p className="mt-4 font-display text-2xl text-ottone-testo">{prezzo}</p>}

            {product.descrizione && <RichText data={product.descrizione} className="mt-8" />}

            {/* Taglie */}
            {(product.taglie?.length ?? 0) > 0 && (
              <div className="mt-8">
                <p className="cartellino text-pietra-scura">Taglie</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.taglie!.map((t, i) => (
                    <span
                      key={i}
                      className={cn(
                        'cartellino border px-3 py-1.5',
                        t.disponibile === false
                          ? 'text-pietra-scura/80 line-through'
                          : 'text-inchiostro',
                      )}
                      style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 50%, transparent)' }}
                    >
                      {t.taglia}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colori */}
            {(product.colori?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="cartellino text-pietra-scura">Colori</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {product.colori!.map((c, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {c.hex && (
                        <span
                          aria-hidden
                          className="inline-block h-4 w-4 rounded-full border border-pietra/40"
                          style={{ backgroundColor: c.hex }}
                        />
                      )}
                      <span className="text-sm text-pietra-scura">{c.nome}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div data-primary-cta className="mt-10 flex flex-col gap-3">
              <WhatsAppButton
                number={settings.whatsappNumber}
                message={productInquiryMessage({ nome: product.nome, sku: product.sku })}
                label="Chiedi disponibilità"
                className="w-full"
              />
              {!product.disponibile && (
                <p className="cartellino text-pietra-scura">
                  Attualmente non in negozio — possiamo verificarne il reperimento.
                </p>
              )}
            </div>

            {/* Cartellino metadati */}
            <dl
              className="mt-10 border-t pt-6 text-sm"
              style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 40%, transparent)' }}
            >
              <MetaRow label="Codice" value={product.sku} />
              {brand?.nome && <MetaRow label="Marchio" value={brand.nome} />}
              {categoria?.nome && <MetaRow label="Categoria" value={categoria.nome} />}
              {stagione && <MetaRow label="Stagione" value={stagione} />}
            </dl>
          </div>
        </div>

        {/* Form di backup */}
        <section data-contact-section className="mt-24 border-t pt-16" style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <Eyebrow>Preferisci scrivere?</Eyebrow>
              <h2 className="mt-4 text-3xl">Richiedi informazioni</h2>
              <p className="mt-4 text-pietra-scura">
                Ti ricontattiamo noi. In alternativa, WhatsApp resta il modo più veloce.
              </p>
            </div>
            <ContactForm endpoint={settings.formspreeEndpoint} oggetto={oggetto} />
          </div>
        </section>

        {/* Correlati */}
        {related.length > 0 && (
          <section className="mt-24">
            <Eyebrow>Potrebbe piacerti</Eyebrow>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA WhatsApp sticky — solo mobile, compare scorrendo il corpo scheda */}
      <ProductStickyCta
        number={settings.whatsappNumber}
        message={productInquiryMessage({ nome: product.nome, sku: product.sku })}
        nome={product.nome}
        prezzo={prezzo}
      />
    </article>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2.5" style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 20%, transparent)' }}>
      <dt className="cartellino text-pietra-scura">{label}</dt>
      <dd className="text-inchiostro">{value}</dd>
    </div>
  )
}
