'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/cn'
import { prefersReduced } from '@/lib/motion'

/**
 * Reveal allo scroll (fade-up). IntersectionObserver leggero e robusto.
 * Senza JS o con reduced-motion il contenuto è già visibile (vedi globals.css).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  /** Ritardo in ms per effetti a cascata (stagger). */
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReduced()) {
      el.classList.add('is-in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add('is-in')
            io.unobserve(el)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
