import Link from 'next/link'

import { Wordmark } from '@/components/ui/Wordmark'
import type { Setting } from '@/payload-types'
import { safeHref } from '@/lib/sanitize'
import { buildWhatsAppLink, appointmentMessage } from '@/lib/whatsapp'

const NAV_ESPLORA = [
  { href: '/catalogo', label: 'Catalogo' },
  { href: '/marchi', label: 'Marchi' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/chi-siamo', label: 'Chi siamo' },
]

export function Footer({ settings }: { settings: Setting }) {
  const a = settings.indirizzo
  const indirizzo = [a?.via, a?.civico].filter(Boolean).join(' ')
  const localita = [a?.cap, a?.citta, a?.provincia ? `(${a.provincia})` : null].filter(Boolean).join(' ')
  const waLink = buildWhatsAppLink({ number: settings.whatsappNumber, message: appointmentMessage() })
  const instagram = safeHref(settings.social?.instagram)
  const facebook = safeHref(settings.social?.facebook)
  const mapsUrl = safeHref(settings.mappa?.googleMapsUrl)

  return (
    <footer className="relative mt-32 bg-inchiostro text-avorio">
      <div className="shell py-20">
        <div>
          <Wordmark as="p" scuro className="text-4xl md:text-5xl" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-avorio/70">
            Abbigliamento uomo a Orbassano dal 2014. Selezione sartoriale, marchi scelti, consiglio su
            misura.
          </p>
        </div>

        <hr className="filetto my-12" />

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol titolo="Esplora">
            {NAV_ESPLORA.map((item) => (
              <Link key={item.href} href={item.href} className="link-segno block text-avorio/80 hover:text-avorio">
                {item.label}
              </Link>
            ))}
          </FooterCol>

          <FooterCol titolo="Il negozio">
            {indirizzo && <p className="text-avorio/80">{indirizzo}</p>}
            {localita && <p className="text-avorio/80">{localita}</p>}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-segno mt-2 inline-block text-ottone-chiaro"
              >
                Apri in Google Maps
              </a>
            )}
          </FooterCol>

          <FooterCol titolo="Orari">
            {(settings.orari ?? []).map((riga, i) => (
              <p key={i} className="flex justify-between gap-4 text-avorio/80">
                <span>{riga.giorni}</span>
                <span>{riga.chiuso ? 'Chiuso' : riga.orario}</span>
              </p>
            ))}
          </FooterCol>

          <FooterCol titolo="Contatti">
            {settings.telefono && (
              <a href={`tel:${settings.telefono.replace(/\s/g, '')}`} className="link-segno block text-avorio/80 hover:text-avorio">
                {settings.telefono}
              </a>
            )}
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="link-segno block text-avorio/80 hover:text-avorio">
              WhatsApp
            </a>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="link-segno block text-avorio/80 hover:text-avorio">
                {settings.email}
              </a>
            )}
            <div className="mt-3 flex gap-4">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="cartellino text-ottone-chiaro hover:text-avorio">
                  Instagram
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="cartellino text-ottone-chiaro hover:text-avorio">
                  Facebook
                </a>
              )}
            </div>
          </FooterCol>
        </div>

        <hr className="filetto my-12" />

        <div className="flex flex-col gap-4 text-xs text-avorio/50 md:flex-row md:items-center md:justify-between">
          <p>
            {settings.ragioneSociale ?? "L'Impronta di Zaffino Fabio"}
            {settings.partitaIva ? ` — P.IVA ${settings.partitaIva}` : ''}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-avorio">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-avorio">
              Cookie Policy
            </Link>
            <span>© {new Date().getFullYear()} L&rsquo;Impronta</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="cartellino mb-4 text-ottone-chiaro">{titolo}</p>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  )
}
