'use client'

import { Analytics } from '@vercel/analytics/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'limpronta-consent-v1'
type Consent = 'accepted' | 'rejected'

/**
 * Cookie banner GDPR: gli essenziali sono sempre attivi; le statistiche
 * (Vercel Analytics) partono SOLO dopo consenso. Accetta/Rifiuta hanno lo
 * stesso peso visivo (niente dark pattern).
 */
export function ConsentBanner() {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Lettura una-tantum del consenso da localStorage (disponibile solo lato client).
    /* eslint-disable react-hooks/set-state-in-effect */
    const stored = localStorage.getItem(KEY)
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored)
    } else {
      setShowBanner(true)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const choose = (c: Consent) => {
    localStorage.setItem(KEY, c)
    setConsent(c)
    setShowBanner(false)
  }

  return (
    <>
      {consent === 'accepted' && <Analytics />}

      {showBanner && (
        <div
          role="dialog"
          aria-label="Preferenze cookie"
          aria-live="polite"
          className="fixed inset-x-0 bottom-0 z-[90] border-t bg-inchiostro text-avorio"
          style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 40%, transparent)' }}
        >
          <div className="shell flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-avorio/85">
              Usiamo cookie tecnici necessari al funzionamento del sito e, con il tuo consenso,
              cookie statistici anonimi per capire come viene usato.{' '}
              <Link href="/cookie-policy" className="link-segno text-ottone-chiaro">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-3">
              <button type="button" onClick={() => choose('rejected')} className="btn btn-ghost text-avorio" style={{ borderColor: 'color-mix(in srgb, var(--color-avorio) 40%, transparent)' }}>
                Rifiuta
              </button>
              <button type="button" onClick={() => choose('accepted')} className="btn btn-loden">
                Accetta
              </button>
            </div>
          </div>
        </div>
      )}

      {!showBanner && (
        <button
          type="button"
          onClick={() => setShowBanner(true)}
          aria-label="Preferenze cookie"
          className="fixed bottom-4 left-4 z-[80] flex h-9 w-9 items-center justify-center rounded-full border bg-lino/90 text-[10px] text-pietra-scura backdrop-blur-sm transition-colors hover:text-loden"
          style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 50%, transparent)' }}
        >
          <span className="cartellino" style={{ fontSize: '0.5rem' }}>
            Cookie
          </span>
        </button>
      )}
    </>
  )
}
