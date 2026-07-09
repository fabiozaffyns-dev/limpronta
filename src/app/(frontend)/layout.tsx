import type { Metadata } from 'next'
import { Cinzel, Fraunces, Hanken_Grotesk } from 'next/font/google'

import { ConsentBanner } from '@/components/ConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { TracciaProvider } from '@/components/motion/TracciaProvider'
import { clothingStoreLd, websiteLd } from '@/lib/json-ld'
import { mediaDoc, mediaUrl } from '@/lib/media'
import { getSettings } from '@/lib/queries'
import { jsonLdSafe } from '@/lib/sanitize'
import { SITE_URL } from '@/lib/site'

import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  style: ['normal', 'italic'],
  // 'opsz' (optical size) variabile: serve all'hover dei link marchio, dove il
  // nome "si incide" guadagnando peso e grazie più piene.
  axes: ['opsz'],
})

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
})

// Wordmark "L'IMPRONTA" — serif lapidaria, vicina all'insegna del negozio.
// Solo il peso 500: è l'unico usato (.wordmark), gli altri erano preload inutili.
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['500'],
})

const TITLE_DEFAULT = "L'Impronta — Abbigliamento uomo a Orbassano"
const DESC_DEFAULT =
  "Abbigliamento uomo multimarca a Orbassano (Torino). Selezione sartoriale di fascia medio-alta, consulenza su misura e prenotazione in negozio."

// generateMetadata (non const) per leggere i valori SEO di default dal CMS
// (Impostazioni → SEO) come fallback: se l'editor li compila, vincono.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const seo = settings.seoDefault
  const titolo = seo?.titolo?.trim() || TITLE_DEFAULT
  const descrizione = seo?.descrizione?.trim() || DESC_DEFAULT
  const ogImg = mediaUrl(seo?.immagine)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titolo, template: "%s · L'Impronta" },
    description: descrizione,
    openGraph: {
      type: 'website',
      locale: 'it_IT',
      siteName: "L'Impronta",
      title: titolo,
      description: descrizione,
      ...(ogImg ? { images: [ogImg] } : {}),
    },
    robots: { index: true, follow: true },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const heroDark = Boolean(mediaDoc(settings.heroMedia)?.url)

  return (
    <html lang="it" className={`${fraunces.variable} ${hanken.variable} ${cinzel.variable}`}>
      <body>
        {/* Aggiunge html.js prima del paint: niente flash, reveal coerente.
           In HOME disattiva anche lo scroll-restoration del browser: col pin
           dell'hero, il ripristino atterrava a metà scena (lino pieno + header
           solida) facendola sembrare "l'inizio del sito, sbagliato". La home
           riparte SEMPRE dalla cima, stile primo accesso. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');if(location.pathname==='/'){try{history.scrollRestoration='manual';window.scrollTo(0,0)}catch(e){}}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(clothingStoreLd(settings)) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(websiteLd()) }}
        />

        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-inchiostro focus:px-4 focus:py-2 focus:text-avorio"
        >
          Salta al contenuto
        </a>

        <LenisProvider>
          <Header whatsappNumber={settings.whatsappNumber} heroDark={heroDark} />
          <main id="contenuto">{children}</main>
          <Footer settings={settings} />
        </LenisProvider>

        <ConsentBanner />
        <TracciaProvider />
      </body>
    </html>
  )
}
