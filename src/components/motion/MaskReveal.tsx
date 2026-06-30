'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

import { EASE_EDITORIAL, prefersReduced } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * "Velina che si scosta": allo scroll il contenuto (di norma un'immagine) si
 * svela con un clip-path inset(100%→0%) dal basso, mentre la foto interna fa un
 * micro contro-scale 1.12→1. Effetto-firma per i media. Niente scrub (once) per
 * restare nitido. Senza JS / reduced-motion il contenuto è già pienamente visibile.
 */
export function MaskReveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = root.current
      if (!el) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        defaults: { ease: EASE_EDITORIAL },
      })
      tl.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1 }, 0)
      const img = el.querySelector('img')
      if (img) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.2 }, 0)
    },
    { scope: root },
  )

  return (
    <div ref={root} className={className ? `reveal-mask overflow-hidden ${className}` : 'reveal-mask overflow-hidden'}>
      {children}
    </div>
  )
}
