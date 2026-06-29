import type { Metadata } from 'next'
import { Cinzel, Fraunces, Hanken_Grotesk } from 'next/font/google'

import { ConsentBanner } from '@/components/ConsentBanner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { clothingStoreLd } from '@/lib/json-ld'
import { mediaDoc } from '@/lib/media'
import { getSettings } from '@/lib/queries'
import { jsonLdSafe } from '@/lib/sanitize'

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
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "L'Impronta — Boutique uomo a Orbassano",
    template: "%s · L'Impronta",
  },
  description:
    "Boutique multimarca di abbigliamento uomo a Orbassano (Torino). Selezione sartoriale di fascia medio-alta, consulenza su misura e prenotazione in negozio.",
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: "L'Impronta",
    title: "L'Impronta — Boutique uomo a Orbassano",
    description:
      "Selezione sartoriale di abbigliamento uomo a Orbassano (Torino). Marchi scelti, consiglio su misura, prenotazione in negozio.",
  },
  robots: { index: true, follow: true },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const heroDark = Boolean(mediaDoc(settings.heroMedia)?.url)

  return (
    <html lang="it" className={`${fraunces.variable} ${hanken.variable} ${cinzel.variable}`}>
      <body>
        {/* Aggiunge html.js prima del paint: niente flash, reveal coerente. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdSafe(clothingStoreLd(settings)) }}
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
      </body>
    </html>
  )
}
