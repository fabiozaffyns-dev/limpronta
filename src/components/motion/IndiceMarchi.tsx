'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'

import { EASE_SOFT, prefersReduced } from '@/lib/motion'
import type { BrandIndexItem } from '@/lib/queries'

gsap.registerPlugin(ScrollTrigger)

/**
 * Indice tipografico dei marchi: nomi giganti in Fraunces, uno per riga, che
 * entrano a onda allo scroll. L'accensione al passaggio (peso + inchiostro, filo
 * d'ottone) e la ritrazione delle altre firme sono in CSS puro. Senza JS /
 * reduced-motion resta un elenco di link statico e leggibile.
 */
export function IndiceMarchi({
  items,
}: {
  items: (BrandIndexItem & { logo?: string | null; logoEmblema?: boolean })[]
}) {
  const root = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      // GSAP prende il controllo: disinnesca la rivelazione CSS di scorta.
      root.current
        ?.querySelectorAll<HTMLElement>('.indice-riga')
        .forEach((riga) => (riga.style.animation = 'none'))
      const batch = ScrollTrigger.batch('.indice-riga', {
        start: 'top 92%',
        onEnter: (b) =>
          gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_SOFT, stagger: 0.06, overwrite: true }),
      })
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      // Lama di luce ottone che spazza il nome invitato — pilotata da GSAP così il
      // background-clip:text ridipinge davvero (la CSS transition non lo faceva).
      const ol = root.current
      let current: Element | null = null
      const sweep = (row: Element | null | undefined) => {
        if (!row || row === current) return
        current = row
        const rake = row.querySelector('.indice-nome-rake')
        if (!rake) return
        gsap.fromTo(
          rake,
          { backgroundPosition: '150% 0', autoAlpha: 1 },
          {
            backgroundPosition: '-60% 0',
            duration: 1.2,
            ease: 'power1.inOut',
            overwrite: 'auto',
            onComplete: () => gsap.set(rake, { autoAlpha: 0 }),
          },
        )
      }
      const onOver = (e: Event) => sweep((e.target as HTMLElement).closest?.('.indice-riga'))
      const onFocus = (e: Event) => sweep((e.target as HTMLElement).closest?.('.indice-riga'))
      const onLeave = () => {
        current = null
      }
      ol?.addEventListener('pointerover', onOver)
      ol?.addEventListener('focusin', onFocus)
      ol?.addEventListener('pointerleave', onLeave)

      return () => {
        batch.forEach((st) => st.kill())
        ol?.removeEventListener('pointerover', onOver)
        ol?.removeEventListener('focusin', onFocus)
        ol?.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: root, dependencies: [] },
  )

  return (
    <ol ref={root} className="indice">
      {items.map((b, i) => (
        <li key={b.id}>
          <Link href={`/marchi/${b.slug}`} className="indice-riga">
            <span className="indice-num cartellino">{String(i + 1).padStart(2, '0')}</span>
            <span className="indice-nome">
              {b.nome}
              <span aria-hidden className="indice-nome-rake">
                {b.nome}
              </span>
            </span>
            <span className="indice-meta cartellino">
              {b.count > 0 ? `${b.count} ${b.count === 1 ? 'pezzo' : 'pezzi'}` : 'Scopri'}
            </span>
            {/* Logo ufficiale monocromo (CSS mask → colore dalla palette). Lo
               span resta anche senza logo: riserva la colonna e tiene le meta
               allineate su tutte le righe. Il nome è già nel testo del link. */}
            <span
              aria-hidden
              className={b.logoEmblema ? 'indice-logo indice-logo-emblema' : 'indice-logo'}
              style={
                b.logo
                  ? { WebkitMaskImage: `url("${b.logo}")`, maskImage: `url("${b.logo}")` }
                  : undefined
              }
            />
            <span aria-hidden className="indice-filo" />
          </Link>
        </li>
      ))}
    </ol>
  )
}
