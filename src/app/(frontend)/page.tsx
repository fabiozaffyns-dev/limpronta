import Link from 'next/link'

import { ProductCard } from '@/components/ProductCard'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Sigillo } from '@/components/ui/Sigillo'
import { DebossHero } from '@/components/motion/DebossHero'
import { Reveal } from '@/components/motion/Reveal'
import {
  getBrands,
  getFeaturedProducts,
  getLookbooks,
  getServices,
  getSettings,
} from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'
import type { Media } from '@/payload-types'

// ISR: rigenera dal CMS ogni 2 minuti (le modifiche in admin compaiono da sole).
export const revalidate = 120

export default async function HomePage() {
  const [featured, brands, lookbooks, services, settings] = await Promise.all([
    getFeaturedProducts(8),
    getBrands(),
    getLookbooks(),
    getServices(),
    getSettings(),
  ])

  const lookbook = lookbooks[0] ?? null
  const lookbookCover = lookbook ? (lookbook.immagini?.[0] as Media | number | undefined) : null

  return (
    <>
      {/* ─── Hero (momento orchestrato) ───────────────────────────────────── */}
      <DebossHero whatsappNumber={settings.whatsappNumber} />

      {/* ─── Muro dei marchi ──────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="border-y" style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}>
          <div className="shell py-10">
            <Eyebrow className="mb-6">I nostri marchi</Eyebrow>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/marchi/${b.slug}`}
                  className="font-display text-xl text-pietra-scura transition-colors hover:text-loden md:text-2xl"
                >
                  {b.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Manifesto ────────────────────────────────────────────────────── */}
      <section className="bg-inchiostro text-avorio">
        <div className="shell py-28 md:py-36">
          <Reveal>
            <Eyebrow scuro>Il nostro credo</Eyebrow>
            <p className="mt-8 max-w-4xl font-display text-3xl leading-[1.18] text-avorio md:text-[3.25rem]">
              <span className="italic text-ottone-chiaro">La cura</span> prima della quantità. Pochi
              marchi, scelti uno a uno, che condividono la stessa idea di misura: tessuti veri, tagli
              che durano, dettagli che si notano solo da vicino.
            </p>
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
                <h2 className="mt-4 text-4xl md:text-5xl">In evidenza</h2>
              </div>
              <Link href="/catalogo" className="cartellino link-segno hidden text-loden sm:block">
                Tutto il catalogo
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} priority={i < 4} />
              </Reveal>
            ))}
          </div>
          <Link href="/catalogo" className="cartellino link-segno mt-10 inline-block text-loden sm:hidden">
            Tutto il catalogo →
          </Link>
        </section>
      )}

      {/* ─── Anteprima lookbook ───────────────────────────────────────────── */}
      {lookbook && (
        <section className="relative bg-inchiostro text-avorio">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[50vh]">
              <CloudinaryImage media={lookbookCover} alt={lookbook.titolo} fillParent sizes="50vw" />
            </div>
            <div className="flex items-center px-8 py-20 md:px-16">
              <Reveal>
                <Eyebrow scuro>Lookbook</Eyebrow>
                <h2 className="mt-4 text-4xl text-avorio md:text-5xl">{lookbook.titolo}</h2>
                <p className="mt-6 max-w-md text-avorio/70">
                  Racconti di stagione: accostamenti, materiali e dettagli che lasciano il segno.
                </p>
                <Link href={`/lookbook/${lookbook.slug}`} className="btn btn-loden mt-10">
                  Sfoglia il lookbook
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ─── Servizi ──────────────────────────────────────────────────────── */}
      {services.length > 0 && (
        <section className="shell py-24">
          <Reveal>
            <Eyebrow>Il nostro servizio</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-4xl md:text-5xl">
              Non solo capi: un modo di vestire pensato su di te.
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden sm:grid-cols-2 lg:grid-cols-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}>
            {services.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 80} className="bg-lino">
                <div className="h-full px-7 py-10">
                  <Sigillo size={40} />
                  <h3 className="mt-6 text-2xl">{s.titolo}</h3>
                </div>
              </Reveal>
            ))}
          </div>
          <Link href="/servizi" className="cartellino link-segno mt-10 inline-block text-loden">
            Scopri tutti i servizi
          </Link>
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
