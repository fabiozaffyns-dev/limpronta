'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useRef, type ElementType, type ReactNode } from 'react'

import { EASE_EDITORIAL, STAGGER, prefersReduced } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * Titolo che "si imprime" riga per riga allo scroll: ogni riga sale da dietro
 * una maschera con un filo di blur che si dissolve. È la versione scroll del
 * deboss dell'hero. Il testo è server-rendered (leggibile senza JS); lo split
 * avviene SOLO dopo document.fonts.ready per non avere salti di riga (no CLS).
 */
export function SplitLines({
  children,
  className,
  as = 'h2',
}: {
  children: ReactNode
  className?: string
  as?: ElementType
}) {
  const ref = useRef<HTMLElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = as as any

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
        split = new SplitText(el, { type: 'lines', mask: 'lines' })
        gsap.set(el, { autoAlpha: 1 }) // rivela il titolo pre-nascosto dal CSS
        tween = gsap.from(split.lines, {
          yPercent: 120,
          autoAlpha: 0,
          filter: 'blur(8px)',
          duration: 1.0,
          ease: EASE_EDITORIAL,
          stagger: STAGGER,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        })
      })

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
    <Tag ref={ref} className={className ? `split-lines ${className}` : 'split-lines'}>
      {children}
    </Tag>
  )
}
