import Link from 'next/link'

import { ProductCard } from '@/components/ProductCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SwapLabel } from '@/components/ui/SwapLabel'
import { Wordmark } from '@/components/ui/Wordmark'
import { DebossHero } from '@/components/motion/DebossHero'
import { CredoReveal } from '@/components/motion/CredoReveal'
import { GridStagger } from '@/components/motion/GridStagger'
import { Reveal } from '@/components/motion/Reveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { cn } from '@/lib/cn'
import { formatStagioneEstesa } from '@/lib/format'
import { mediaDoc } from '@/lib/media'
import { safeHref } from '@/lib/sanitize'
import {
  getBrands,
  getFeaturedProducts,
  getLookbooks,
  getSettings,
} from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'

// ISR: rigenera dal CMS ogni 2 minuti (le modifiche in admin compaiono da sole).
export const revalidate = 120

export default async function HomePage() {
  const [featured, brands, lookbooks, settings] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
    getLookbooks(),
    getSettings(),
  ])

  const lookbook = lookbooks[0] ?? null
  const lookbookStagione = lookbook ? formatStagioneEstesa(lookbook.stagione) : null

  // Muro dei marchi: solo quelli spuntati "In evidenza in home" in admin.
  // Finché nessuno è spuntato, si mostrano tutti (niente sezione vuota).
  const brandsEvidenza = brands.filter((b) => b.inEvidenzaHome)
  const brandsMuro = brandsEvidenza.length > 0 ? brandsEvidenza : brands

  const heroDoc = mediaDoc(settings.heroMedia)
  const heroMedia = heroDoc?.url
    ? { url: heroDoc.url, isVideo: Boolean(heroDoc.mimeType?.startsWith('video')) }
    : null

  return (
    <>
      {/* ─── Hero (momento orchestrato) ───────────────────────────────────── */}
      <DebossHero whatsappNumber={settings.whatsappNumber} heroMedia={heroMedia} />

      {/* ─── Muro dei marchi ──────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="border-y" style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}>
          <div className="shell py-12">
            <Eyebrow className="mb-6">Le firme principali</Eyebrow>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              {brandsMuro.map((b) => {
                // Click sul marchio in home → sito ufficiale del brand (nuova scheda).
                // Senza sito impostato, fallback alla pagina marchio interna.
                const sito = safeHref(b.sito)
                const cls = 'font-display link-marchio text-xl md:text-2xl'
                return sito ? (
                  <a key={b.id} href={sito} target="_blank" rel="noopener noreferrer" className={cls}>
                    <SwapLabel as="link">{b.nome}</SwapLabel>
                  </a>
                ) : (
                  <Link key={b.id} href={`/marchi/${b.slug}`} className={cls}>
                    <SwapLabel as="link">{b.nome}</SwapLabel>
                  </Link>
                )
              })}
            </div>
            <Link href="/marchi" className="btn btn-ghost mt-10">
              <SwapLabel>Tutti i marchi</SwapLabel>
            </Link>
          </div>
        </section>
      )}

      {/* ─── Manifesto ────────────────────────────────────────────────────── */}
      <section className="bg-inchiostro text-avorio">
        <div className="shell py-28 md:py-36">
          <Reveal>
            <Eyebrow scuro>Il nostro credo</Eyebrow>
            <CredoReveal className="mt-8 max-w-4xl font-display text-3xl leading-[1.18] text-avorio md:text-[3.25rem]">
              <span className="italic text-ottone-chiaro">La cura</span> prima della quantità. Pochi marchi, scelti uno a
              uno, che condividono la stessa idea di misura: tessuti veri, tagli che durano, dettagli
              che si notano solo da vicino.
            </CredoReveal>
            <p className="mt-10 max-w-xl text-lg text-avorio/70">
              Vestire bene è una forma di rispetto — per sé e per gli altri. Dal 2014 è il nostro
              mestiere, in Via Vittorio Emanuele II a Orbassano.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── In evidenza ──────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="shell py-24">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Selezione</Eyebrow>
                <SplitLines as="h2" className="mt-4 text-4xl md:text-5xl">
                  In evidenza
                </SplitLines>
              </div>
              <Link href="/catalogo" className="cartellino link-segno hidden text-ottone-testo sm:block">
                Tutto il catalogo
              </Link>
            </div>
          </Reveal>

          <GridStagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {/* niente priority: la sezione è ~3 viewport sotto la piega, i preload
               ad alta priorità competevano con il vero LCP (l'hero). */}
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </GridStagger>
          <Link href="/catalogo" className="cartellino link-segno mt-10 inline-block text-ottone-testo sm:hidden">
            Tutto il catalogo →
          </Link>
        </section>
      )}

      {/* ─── Anteprima lookbook ───────────────────────────────────────────── */}
      {lookbook && (
        <section className="relative bg-inchiostro text-avorio">
          <div className="grid lg:grid-cols-2">
            <div className="relative flex min-h-[52vh] items-center justify-center overflow-hidden px-8 py-20">
              <span
                aria-hidden
                className="absolute inset-6 border"
                style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 22%, transparent)' }}
              />
              <div className="relative text-center">
                {lookbookStagione && (
                  <span className="cartellino text-ottone-chiaro">{lookbookStagione}</span>
                )}
                <Wordmark scuro className="mt-6 block text-5xl md:text-6xl" />
              </div>
            </div>
            <div className="flex items-center px-8 py-20 md:px-16">
              <Reveal>
                <Eyebrow scuro>Lookbook</Eyebrow>
                <SplitLines as="h2" className="mt-4 text-4xl text-avorio md:text-5xl">
                  {lookbook.titolo}
                </SplitLines>
                <p className="mt-6 max-w-md text-avorio/70">
                  Racconti di stagione: accostamenti, materiali e dettagli che lasciano il segno.
                </p>
                <Link href={`/lookbook/${lookbook.slug}`} className="btn btn-ottone mt-10">
                  <SwapLabel>Sfoglia il lookbook</SwapLabel>
                </Link>
              </Reveal>
            </div>
          </div>

          {/* Filmstrip: una sola riga di provini dalla galleria — MAI a capo.
             3 su mobile, 4 su tablet, 6 su desktop (gli extra sono nascosti
             dai breakpoint). Ogni provino porta al lookbook. */}
          {(lookbook.immagini ?? []).length >= 3 && (
            <GridStagger className="grid grid-cols-3 gap-2 px-2 pb-2 sm:grid-cols-4 lg:grid-cols-6">
              {(lookbook.immagini ?? []).slice(0, 6).map((img, i) => (
                <Link
                  key={i}
                  href={`/lookbook/${lookbook.slug}`}
                  aria-label={`Sfoglia il lookbook ${lookbook.titolo}`}
                  className={cn(
                    'group relative block overflow-hidden',
                    i === 3 && 'hidden sm:block',
                    i >= 4 && 'hidden lg:block',
                  )}
                >
                  <CloudinaryImage
                    media={img}
                    alt=""
                    aspect="1 / 1"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 17vw"
                    imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-inchiostro/25 transition-colors duration-500 group-hover:bg-inchiostro/0" />
                </Link>
              ))}
            </GridStagger>
          )}
        </section>
      )}

      {/* ─── Contatti / negozio ───────────────────────────────────────────── */}
      <section className="shell pb-12">
        <Reveal>
          <div className="border p-10 md:p-16" style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 40%, transparent)' }}>
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Vieni a trovarci</Eyebrow>
                <p className="mt-5 font-display text-3xl leading-tight md:text-4xl">
                  {[settings.indirizzo?.via, settings.indirizzo?.civico].filter(Boolean).join(' ') ||
                    'Via Vittorio Emanuele II 12/A'}
                  <br />
                  <span className="text-pietra-scura">
                    {settings.indirizzo?.cap ?? '10043'} {settings.indirizzo?.citta ?? 'Orbassano'} (
                    {settings.indirizzo?.provincia ?? 'TO'})
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {settings.telefono && (
                  <a href={`tel:${settings.telefono.replace(/\s/g, '')}`} className="btn btn-ghost">
                    {settings.telefono}
                  </a>
                )}
                <WhatsAppButton number={settings.whatsappNumber} message={appointmentMessage()} label="Scrivici su WhatsApp" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
