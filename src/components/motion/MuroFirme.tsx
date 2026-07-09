'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { prefersReduced } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

// Stesso deboss del wordmark hero: il "colpo" che imprime le firme nel Lino.
const DEBOSS = '0 1px 0 rgba(255,255,255,0.5), 0 -1px 1px rgba(28,26,23,0.12)'

/**
 * "Le firme si imprimono": momento orchestrato in tre battute quando la
 * sezione entra in vista (una sola volta) —
 *   1. i nomi salgono da dietro una maschera, a onda DAL CENTRO (la
 *      composizione è centrata: l'onda irradia), con un filo di blur;
 *   2. il colpo: il deboss dell'hero appare sui nomi (si imprimono);
 *   3. la lama di luce ottone spazza l'intera fila, una volta.
 * Ogni figlio va marcato [data-firma] con un solo elemento interno (la
 * maschera è l'overflow del wrapper). Senza JS / reduced-motion: tutto statico.
 */
export function MuroFirme({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = root.current
      if (!el) return
      const items = Array.from(el.querySelectorAll<HTMLElement>('[data-firma]'))
      if (!items.length) return
      // GSAP prende il controllo: disinnesca la rivelazione CSS di scorta.
      items.forEach((item) => (item.style.animation = 'none'))
      const inner = items
        .map((item) => item.firstElementChild)
        .filter((n): n is HTMLElement => n instanceof HTMLElement)
      const links = el.querySelectorAll<HTMLElement>('.link-marchio')
      const lama = el.querySelector<HTMLElement>('[data-lama]')

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      })
      tl.set(items, { autoAlpha: 1 }, 0)
      tl.from(
        inner,
        {
          yPercent: 115,
          filter: 'blur(8px)',
          duration: 0.9,
          ease: 'expo.out',
          stagger: { each: 0.07, from: 'center' },
        },
        0,
      )
      // Il colpo: micro-serrata + deboss che affiora.
      tl.fromTo(
        links,
        { textShadow: '0 0 0 rgba(0,0,0,0)' },
        { textShadow: DEBOSS, duration: 0.5, ease: 'power2.out' },
        '-=0.35',
      )
      tl.fromTo(
        el,
        { scale: 1.012 },
        { scale: 1, duration: 0.5, ease: 'power4.out', transformOrigin: '50% 60%', clearProps: 'transform' },
        '<',
      )
      // La lama di luce: un solo passaggio su tutta la fila.
      if (lama) {
        tl.fromTo(
          lama,
          { xPercent: -180, autoAlpha: 1 },
          { xPercent: 300, duration: 1.05, ease: 'power2.inOut' },
          '-=0.5',
        ).set(lama, { autoAlpha: 0 })
      }

      // Ricalcola la soglia dopo i font (evita partenze sfasate).
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    },
    { scope: root },
  )

  return (
    <div ref={root} className={cn('muro-firme relative', className)}>
      {children}
      <span aria-hidden data-lama className="muro-lama" />
    </div>
  )
}
