'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

import { EASE_SOFT, prefersReduced } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Le tessere di una griglia entrano con uno stagger a colonne (onda), non a
 * blocco. I figli sono pre-nascosti via CSS (solo con JS) per evitare il flash;
 * qui li portiamo allo stato finale quando entrano in vista.
 */
export function GridStagger({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = root.current
      if (!el) return
      const items = Array.from(el.children) as HTMLElement[]
      if (!items.length) return
      // GSAP prende il controllo: disinnesca la rivelazione CSS di scorta.
      items.forEach((item) => (item.style.animation = 'none'))
      const triggers = ScrollTrigger.batch(items, {
        start: 'top 92%',
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: EASE_SOFT,
            stagger: { each: 0.07, grid: 'auto', from: 'start' },
            overwrite: true,
          }),
      })
      return () => triggers.forEach((t) => t.kill())
    },
    { scope: root },
  )

  return (
    <div ref={root} className={className ? `grid-stagger ${className}` : 'grid-stagger'}>
      {children}
    </div>
  )
}
