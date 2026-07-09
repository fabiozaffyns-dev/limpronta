'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePathname } from 'next/navigation'

import { prefersReduced } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger)

/**
 * "Il segno col gessetto": i filetti in ottone (.filetto) e i trattini delle
 * eyebrow ([data-traccia]) si DISEGNANO da sinistra (scaleX 0→1) quando entrano
 * in vista. Un solo ScrollTrigger.batch globale, ri-eseguito a ogni cambio
 * pagina. Lo stile vive in globals.css (CSS-puro): senza JS i segni sono pieni.
 */
export function TracciaProvider() {
  const pathname = usePathname()

  useGSAP(
    () => {
      if (prefersReduced()) return
      const els = gsap.utils.toArray<HTMLElement>('.filetto, [data-traccia]')
      if (!els.length) return
      const triggers = ScrollTrigger.batch(els, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) => batch.forEach((el) => el.classList.add('is-tracciato')),
      })
      return () => triggers.forEach((t) => t.kill())
    },
    { dependencies: [pathname] },
  )

  return null
}
