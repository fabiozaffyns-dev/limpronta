'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useRef, type ReactNode } from 'react'

import { prefersReduced } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

/**
 * Il testo del "credo" si ACCENDE parola per parola — da smorzato a pieno —
 * allo scroll, UNA SOLA volta (poi resta acceso). Il testo è server-rendered
 * (leggibile senza JS); con reduced-motion resta pieno e statico.
 */
export function CredoReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      if (prefersReduced()) return
      const el = ref.current
      if (!el) return
      let split: SplitText | null = null
      let cancelled = false

      document.fonts.ready.then(() => {
        if (cancelled || !ref.current) return
        split = new SplitText(el, { type: 'words' })
        gsap.from(split.words, {
          color: 'rgba(242, 236, 224, 0.18)',
          duration: 0.7,
          ease: 'power2.out',
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
      })

      return () => {
        cancelled = true
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
