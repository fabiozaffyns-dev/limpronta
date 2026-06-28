import type { Metadata } from 'next'

import { ContactForm } from '@/components/ContactForm'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageIntro } from '@/components/ui/PageIntro'
import { Sigillo } from '@/components/ui/Sigillo'
import { getSettings } from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    "Dove siamo e come raggiungerci: L'Impronta, Via Vittorio Emanuele II 12/A, Orbassano (TO). Telefono, WhatsApp e modulo contatti.",
}

export default async function ContattiPage() {
  const settings = await getSettings()
  const a = settings.indirizzo
  const via = [a?.via, a?.civico].filter(Boolean).join(' ')
  const localita = [a?.cap, a?.citta, a?.provincia ? `(${a.provincia})` : null].filter(Boolean).join(' ')
  const mapsUrl =
    settings.mappa?.googleMapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${via} ${localita}`)}`

  return (
    <>
      <PageIntro eyebrow="Vieni a trovarci" titolo="Contatti">
        Il consiglio migliore nasce di persona. Passa in negozio, o scrivici: ti rispondiamo presto.
      </PageIntro>

      <section className="shell grid gap-16 pb-24 lg:grid-cols-2">
        <div className="space-y-10">
          <div>
            <Eyebrow>Il negozio</Eyebrow>
            <p className="mt-4 font-display text-2xl leading-snug">
              {via || 'Via Vittorio Emanuele II 12/A'}
              <br />
              <span className="text-pietra-scura">{localita || '10043 Orbassano (TO)'}</span>
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <Eyebrow>Telefono</Eyebrow>
              {settings.telefono && (
                <a href={`tel:${settings.telefono.replace(/\s/g, '')}`} className="link-segno mt-3 block text-lg">
                  {settings.telefono}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="link-segno mt-2 block text-pietra-scura">
                  {settings.email}
                </a>
              )}
            </div>

            <div>
              <Eyebrow>Orari</Eyebrow>
              <div className="mt-3 space-y-1 text-sm">
                {(settings.orari ?? []).map((r, i) => (
                  <p key={i} className="flex justify-between gap-4 text-pietra-scura">
                    <span className="text-inchiostro">{r.giorni}</span>
                    <span>{r.chiuso ? 'Chiuso' : r.orario}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <WhatsAppButton number={settings.whatsappNumber} message={appointmentMessage()} label="Scrivici su WhatsApp" />
            {(settings.social?.instagram || settings.social?.facebook) && (
              <div className="flex items-center gap-4">
                {settings.social?.instagram && (
                  <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="cartellino link-segno text-loden">
                    Instagram
                  </a>
                )}
                {settings.social?.facebook && (
                  <a href={settings.social.facebook} target="_blank" rel="noopener noreferrer" className="cartellino link-segno text-loden">
                    Facebook
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Blocco mappa statico (niente iframe prima del consenso) */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex aspect-[16/9] flex-col items-center justify-center gap-3 border bg-lino-chiaro text-center transition-colors hover:bg-lino-scuro"
            style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 40%, transparent)' }}
          >
            <Sigillo size={48} />
            <span className="cartellino text-inchiostro">Apri in Google Maps →</span>
          </a>
        </div>

        <div>
          <Eyebrow>Scrivici</Eyebrow>
          <h2 className="mt-3 mb-8 text-3xl">Modulo contatti</h2>
          <ContactForm endpoint={settings.formspreeEndpoint} />
        </div>
      </section>
    </>
  )
}
