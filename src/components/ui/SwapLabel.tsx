import type { ReactNode } from 'react'

/**
 * Etichetta con "swap" verticale: due righe gemelle impilate. In hover la riga
 * visibile esce verso l'alto dietro una maschera e la copia entra dal basso —
 * come un cartellino sartoriale che gira. La copia è aria-hidden, così screen
 * reader e selezione testo restano puliti. I colori delle righe vivono nelle
 * classi CSS (.btn-swap / .swap-line), non in utility Tailwind sull'elemento,
 * così vincono il cascade in modo deterministico.
 *
 * `as="btn"` → dentro un .btn (avvolgere SOLO il testo, l'icona resta fuori).
 * `as="link"` → per i link grandi con classe .link-marchio.
 */
export function SwapLabel({ children, as = 'btn' }: { children: ReactNode; as?: 'btn' | 'link' }) {
  if (as === 'link') {
    return (
      <span className="swap-track">
        <span className="swap-line" data-line="out">
          {children}
        </span>
        <span className="swap-line" data-line="in" aria-hidden="true">
          {children}
        </span>
      </span>
    )
  }
  return (
    <span className="btn-swap">
      <span data-swap-out>{children}</span>
      <span data-swap-in aria-hidden="true">
        {children}
      </span>
    </span>
  )
}
