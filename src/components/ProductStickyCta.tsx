'use client'

import { useEffect, useState } from 'react'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { cn } from '@/lib/cn'

/**
 * Barra CTA WhatsApp sticky in fondo — SOLO mobile (lg:hidden). Compare mentre
 * si scorre il corpo della scheda (descrizione/taglie/metadati) e si RITIRA
 * quando è già visibile il bottone principale in alto ([data-primary-cta]) o la
 * sezione contatti in basso ([data-contact-section]): niente doppione, niente
 * footer coperto. Solo transform/opacity; su desktop non esiste.
 */
export function ProductStickyCta({
  number,
  message,
  nome,
  prezzo,
}: {
  number?: string | null
  message: string
  nome: string
  prezzo?: string | null
}) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const primary = document.querySelector('[data-primary-cta]')
    const contact = document.querySelector('[data-contact-section]')
    if (!primary && !contact) return
    const vis = { primary: false, contact: false }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === primary) vis.primary = e.isIntersecting
          if (e.target === contact) vis.contact = e.isIntersecting
        }
        setShow(!vis.primary && !vis.contact)
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    if (primary) io.observe(primary)
    if (contact) io.observe(contact)
    return () => io.disconnect()
  }, [])

  return (
    <div
      aria-hidden={!show}
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t bg-lino/95 backdrop-blur-sm transition-transform duration-300 ease-out lg:hidden',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
      style={{
        borderColor: 'color-mix(in srgb, var(--color-ottone) 30%, transparent)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* pl-16: lascia spazio al pulsante "Cookie" fisso in basso a sinistra */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 py-3 pr-4 pl-16">
        <div className="min-w-0 flex-1">
          <p className="cartellino truncate text-inchiostro">{nome}</p>
          {prezzo && <p className="cartellino text-ottone-testo">{prezzo}</p>}
        </div>
        <WhatsAppButton
          number={number}
          message={message}
          label="Chiedi disponibilità"
          className="shrink-0 whitespace-nowrap"
        />
      </div>
    </div>
  )
}
