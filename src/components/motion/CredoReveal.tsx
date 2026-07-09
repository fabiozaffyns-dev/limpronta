'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useRef, type ReactNode } from 'react'

import { prefersReduced } from '@/lib/motion'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Il testo del "credo" si ACCENDE progressivamente mentre scorri: una parte alla
 * volta, parola per parola, fino al completamento (scrub legato allo scroll).
 * Il testo è server-rendered (leggibile senza JS); con reduced-motion resta
 * pieno e statico.
 */
export function CredoReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = ref.current
      if (!el) return
      let split: SplitText | null = null
      let tween: gsap.core.Tween | null = null
      let cancelled = false

      document.fonts.ready.then(() => {
        if (cancelled || !ref.current) return
        split = new SplitText(el, { type: 'words' })
        // Progressivo: le parole si accendono UNA PARTE ALLA VOLTA mentre scorri,
        // fino al completamento (scrub legato alla posizione di scroll). Ogni parola
        // va dal suo colore smorzato al suo colore naturale (ottone per "La cura").
        // Colore di partenza più alto (0.42, non 0.16) e fine anticipata (center 60%)
        // così il testo è già leggibile mentre lo si legge, anche su mobile alto.
        tween = gsap.from(split.words, {
          color: 'rgba(242, 236, 224, 0.42)',
          ease: 'none',
          duration: 0.4,
          stagger: 0.25,
          scrollTrigger: { trigger: el, start: 'top 82%', end: 'center 60%', scrub: 0.5 },
        })
      })

      // Il tween nasce in fonts.ready (fuori dallo scope sincrono di useGSAP):
      // il suo ScrollTrigger NON è tracciato dal context → va ucciso a mano nel
      // cleanup, altrimenti resta orfano a ogni cambio rotta (leak).
      return () => {
        cancelled = true
        tween?.scrollTrigger?.kill()
        tween?.kill()
        split?.revert()
      }
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  )
}
