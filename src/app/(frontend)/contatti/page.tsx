import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { StoreMap } from '@/components/StoreMap'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Reveal } from '@/components/motion/Reveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { EditorialFigure } from '@/components/ui/EditorialFigure'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageIntro } from '@/components/ui/PageIntro'
import { getSettings } from '@/lib/queries'
import { safeHref } from '@/lib/sanitize'
import { appointmentMessage } from '@/lib/whatsapp'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    "Dove siamo e come raggiungerci: L'Impronta, Via Vittorio Emanuele II 12/A, Orbassano (TO). Telefono, WhatsApp, appuntamento e modulo contatti.",
  alternates: { canonical: '/contatti' },
}

const OTTONE = (pct: number) => `1px solid color-mix(in srgb, var(--color-ottone) ${pct}%, transparent)`

export default async function ContattiPage() {
  const settings = await getSettings()
  const a = settings.indirizzo
  const via = [a?.via, a?.civico].filter(Boolean).join(' ') || 'Via Vittorio Emanuele II 12/A'
  const localita =
    [a?.cap, a?.citta, a?.provincia ? `(${a.provincia})` : null].filter(Boolean).join(' ') ||
    '10043 Orbassano (TO)'
  const mapsUrl =
    safeHref(settings.mappa?.googleMapsUrl) ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${via} ${localita}`)}`
  const instagram = safeHref(settings.social?.instagram)
  const facebook = safeHref(settings.social?.facebook)
  const lat = typeof settings.mappa?.lat === 'number' ? settings.mappa.lat : 45.00662805023706
  const lng = typeof settings.mappa?.lng === 'number' ? settings.mappa.lng : 7.5364317686679625

  return (
    <>
      <PageIntro eyebrow="Vieni a trovarci" titolo="Contatti">
        Il consiglio migliore nasce di persona: il tempo di guardare, di toccare la stoffa, di capire
        cosa ti sta davvero bene. Passa in negozio, o scrivici — ti rispondiamo presto e volentieri.
      </PageIntro>

      {/* ─── La lettera ───────────────────────────────────────────────────── */}
      <section className="shell pb-14">
        <Reveal>
          <p className="font-display max-w-3xl text-[clamp(1.7rem,4vw,2.7rem)] leading-[1.18]">
            {/* ottone-testo, non ottone-chiaro: su fondo lino serve il contrasto AA */}
            <span className="italic text-ottone-testo">Caro cliente,</span> vestire bene comincia da una
            conversazione. Da noi non trovi un camerino frettoloso, ma{' '}
            <span className="text-ottone-testo">il tempo</span> di capire cosa ti sta davvero bene: il
            tessuto giusto, la vestibilità giusta, il consiglio di chi lo fa dal 2014.
          </p>
        </Reveal>
        <hr className="filetto mt-12" data-traccia />
      </section>

      {/* ─── Il cartellino del negozio + foto/modulo ──────────────────────── */}
      <section id="scrivici" className="shell grid gap-12 pb-24 lg:grid-cols-12">
        <Reveal className="lg:col-span-7 space-y-10">
          <div className="p-8 md:p-10" style={{ border: OTTONE(40) }}>
            <p className="font-display mb-10 text-xl leading-snug text-pietra-scura">
              Ti aspettiamo in Via Vittorio Emanuele II, nel cuore di Orbassano.
            </p>

            <div className="space-y-8">
              <div>
                <Eyebrow>Indirizzo</Eyebrow>
                <p className="font-display mt-3 text-2xl leading-snug">
                  {via}
                  <br />
                  <span className="text-pietra-scura">{localita}</span>
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <Eyebrow>Contatti</Eyebrow>
                  {settings.telefono && (
                    <a
                      href={`tel:${settings.telefono.replace(/\s/g, '')}`}
                      className="link-segno mt-3 block text-lg"
                    >
                      {settings.telefono}
                    </a>
                  )}
                  {settings.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="link-segno mt-2 block text-pietra-scura"
                    >
                      {settings.email}
                    </a>
                  )}
                </div>

                <div>
                  <Eyebrow>Orari</Eyebrow>
                  <div className="mt-3 space-y-1 text-sm">
                    {(settings.orari ?? []).map((r, i) => (
                      <p key={i} className="flex items-baseline justify-between gap-4">
                        <span className="text-inchiostro">{r.giorni}</span>
                        <span className={r.chiuso ? 'text-pietra-scura' : 'text-pietra-scura'}>
                          {r.chiuso ? 'Chiuso' : r.orario}
                        </span>
                      </p>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-pietra-scura">
                    Festivi e orari speciali: scrivici, ci organizziamo.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <WhatsAppButton
                  number={settings.whatsappNumber}
                  message={appointmentMessage()}
                  label="Scrivici su WhatsApp"
                />
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cartellino link-segno inline-flex min-h-[44px] items-center text-ottone-testo"
                  >
                    Instagram
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cartellino link-segno inline-flex min-h-[44px] items-center text-ottone-testo"
                  >
                    Facebook
                  </a>
                )}
              </div>
            </div>
          </div>
          <EditorialFigure
            media={settings.contattiFoto ?? settings.chiSiamoFoto2}
            alt="Dentro L'Impronta a Orbassano"
            aspect="16 / 10"
            label="In negozio · Orbassano"
            sizes="(max-width: 1024px) 100vw, 58vw"
            parallax
          />
        </Reveal>

        <Reveal delay={120} className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Eyebrow>Preferisci scrivere?</Eyebrow>
            <h2 className="font-display mt-3 mb-2 text-3xl">Scrivici due righe</h2>
            <p className="mb-6 text-pietra-scura">
              Raccontaci cosa cerchi — un&rsquo;occasione, un capo, un&rsquo;idea regalo — e ti
              rispondiamo di persona, non con una risposta automatica.
            </p>
            <ContactForm endpoint={settings.formspreeEndpoint} />
          </div>
        </Reveal>
      </section>

      {/* ─── Il gesto: su appuntamento ────────────────────────────────────── */}
      <section className="bg-inchiostro text-avorio">
        <div className="shell py-24 md:py-28">
          <div className="mx-auto max-w-3xl p-10 md:p-14" style={{ border: OTTONE(30) }}>
            <Eyebrow scuro>Su appuntamento</Eyebrow>
            <SplitLines
              as="p"
              className="font-display mt-5 max-w-2xl text-[clamp(1.7rem,4vw,3rem)] leading-[1.12]"
            >
              Vuoi tutta la nostra attenzione? Fissa un momento tuo.
            </SplitLines>
            <p className="mt-6 max-w-xl text-avorio/80">
              Fuori orario o in totale tranquillità: fissa un appuntamento e il negozio è tuo. Un
              caffè, qualche capo scelto per te, nessuna fretta.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <WhatsAppButton
                number={settings.whatsappNumber}
                message={appointmentMessage()}
                label="Fissa un appuntamento"
                variant="ottone"
              />
              <a href="#scrivici" className="link-segno text-sm text-avorio/80">
                Preferisci scrivere? Compila il modulo.
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── La bottega (mappa incorniciata) ──────────────────────────────── */}
      <section className="shell pt-20">
        <p className="cartellino mb-4 text-ottone-testo">La nostra bottega</p>
        <hr className="filetto mb-6" data-traccia />
        <div style={{ border: OTTONE(35) }}>
          <StoreMap
            lat={lat}
            lng={lng}
            label={[via, localita].filter(Boolean).join(' · ')}
            mapsUrl={mapsUrl}
          />
        </div>
      </section>

      {/* ─── Coda ─────────────────────────────────────────────────────────── */}
      <section className="shell py-24 text-center">
        <Reveal>
          <p className="font-display text-3xl">A presto.</p>
          <p className="cartellino mt-4 text-ottone-testo">L&rsquo;Impronta — Orbassano (TO)</p>
        </Reveal>
        <hr className="filetto mt-12" data-traccia />
      </section>
    </>
  )
}
