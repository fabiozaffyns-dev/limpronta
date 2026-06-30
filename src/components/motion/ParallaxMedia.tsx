'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef, type ReactNode } from 'react'

import { prefersReduced } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Parallax disciplinato: l'immagine interna scorre di pochi punti percentuali
 * più lenta del flusso, dando profondità editoriale. L'immagine è sovradimensionata
 * (scale 1.12) così lo spostamento non scopre mai bordi vuoti (zero CLS).
 * Da usare SOLO su media-racconto, MAI su card di catalogo (lì serve nitidezza).
 */
export function ParallaxMedia({
  children,
  amount = 8,
  className,
}: {
  children: ReactNode
  amount?: number
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = root.current
      if (!el) return
      const img = el.querySelector('img')
      if (!img) return
      gsap.set(img, { scale: 1.12, willChange: 'transform' })
      gsap.fromTo(
        img,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: root },
  )

  return (
    <div ref={root} className={className ? `overflow-hidden ${className}` : 'overflow-hidden'}>
      {children}
    </div>
  )
}
