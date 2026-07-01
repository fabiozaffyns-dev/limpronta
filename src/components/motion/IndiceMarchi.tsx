'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef, useState, type FocusEvent, type MouseEvent } from 'react'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import { EASE_EDITORIAL, EASE_SOFT, prefersReduced } from '@/lib/motion'
import type { BrandIndexItem } from '@/lib/queries'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * "L'Indice Vivo" — la pagina Marchi come sommario di rivista. I nomi in Fraunces
 * entrano a onda; invitando una firma (hover/focus) le altre si defocalizzano, un
 * filo d'ottone si traccia e nel palco sticky affiora la foto-prodotto (clip-path
 * dal basso). Interazione O(1): sempre 1 riga attiva + 1 foto. Senza JS resta un
 * indice di link leggibile; con reduced-motion niente entrata/emersione, solo il
 * crossfade istantaneo del palco.
 */
export function IndiceMarchi({ items }: { items: BrandIndexItem[] }) {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)

  const activate = (e: MouseEvent | FocusEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-index]')
    if (!el) return
    const i = Number(el.dataset.index)
    if (Number.isNaN(i)) return
    setActive(i)
    setHovering(true)
  }

  // Entrata a onda + parallax lieve del palco (un solo handler, gated).
  useGSAP(
    () => {
      if (prefersReduced()) return
      const batch = ScrollTrigger.batch('.indice-riga', {
        start: 'top 92%',
        onEnter: (b) =>
          gsap.to(b, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE_SOFT, stagger: 0.06, overwrite: true }),
      })

      let onMove: ((e: PointerEvent) => void) | null = null
      const palco = root.current?.querySelector<HTMLElement>('.palco')
      const fine = window.matchMedia('(pointer: fine)').matches
      if (palco && fine) {
        const qx = gsap.quickTo(palco, 'x', { duration: 0.5, ease: 'power3' })
        const qy = gsap.quickTo(palco, 'y', { duration: 0.5, ease: 'power3' })
        onMove = (e: PointerEvent) => {
          const r = root.current?.getBoundingClientRect()
          if (!r) return
          qx(((e.clientX - (r.left + r.width / 2)) / r.width) * 10)
          qy(((e.clientY - (r.top + r.height / 2)) / r.height) * 10)
        }
        root.current?.addEventListener('pointermove', onMove)
      }

      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      return () => {
        batch.forEach((st) => st.kill())
        if (onMove) root.current?.removeEventListener('pointermove', onMove)
      }
    },
    { scope: root, dependencies: [] },
  )

  // La foto attiva "affiora" dal basso (in più al crossfade CSS d'opacità).
  useGSAP(
    () => {
      if (prefersReduced()) return
      const figure = root.current?.querySelectorAll<HTMLElement>('.palco-foto')[active]
      const img = figure?.querySelector('img')
      if (img) {
        gsap.fromTo(
          img,
          { clipPath: 'inset(100% 0 0 0)' },
          { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: EASE_EDITORIAL, overwrite: 'auto' },
        )
      }
      // Lama di luce ottone che attraversa il nome (la "firma" dell'hero).
      const rake = figure?.querySelector('.palco-nome-rake')
      if (rake) {
        gsap.fromTo(
          rake,
          { '--rake': '-40%' },
          { '--rake': '140%', duration: 0.7, ease: 'none', overwrite: 'auto' },
        )
      }
    },
    { scope: root, dependencies: [active] },
  )

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
      <ol
        className="indice"
        onMouseOver={activate}
        onMouseLeave={() => setHovering(false)}
        onFocusCapture={activate}
      >
        {items.map((b, i) => (
          <li key={b.id}>
            <Link
              href={`/marchi/${b.slug}`}
              data-index={i}
              className={cn('indice-riga', i === active && 'is-active', hovering && i !== active && 'is-dim')}
            >
              <span className="indice-num cartellino">{String(i + 1).padStart(2, '0')}</span>
              <span className="indice-nome">{b.nome}</span>
              <span className="indice-meta cartellino">{b.count > 0 ? `${b.count} pezzi` : 'Scopri'}</span>
              <span aria-hidden className="indice-filo" />
            </Link>
          </li>
        ))}
      </ol>

      {/* Palco: anteprima decorativa (i dati veri sono nei link). */}
      <div aria-hidden className="hidden lg:block">
        <div className="palco">
          {items.map((b, i) => (
            <figure key={b.id} className={cn('palco-foto', i === active && 'is-active')}>
              {b.foto ? (
                <CloudinaryImage media={b.foto} alt="" fillParent sizes="520px" priority={i === 0} />
              ) : (
                <div className="placeholder-materico absolute inset-0" role="img" aria-label={b.nome} />
              )}
              <figcaption className="palco-caption">
                <span className="palco-nome-wrap">
                  <span className="palco-nome">{b.nome}</span>
                  <span aria-hidden className="palco-nome-rake">
                    {b.nome}
                  </span>
                </span>
                {b.blurb && (
                  <span className="mt-3 block max-w-sm text-sm leading-relaxed text-avorio/75">{b.blurb}</span>
                )}
                <span className="cartellino mt-4 block text-ottone-chiaro">Vedi il marchio →</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
