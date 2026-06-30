'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

import { prefersReduced } from '@/lib/motion'

/**
 * "Respiro" della Fraunces variabile: all'ingresso in vista il titolo guadagna
 * peso e optical-size (prende corpo come inchiostro). CSS-driven (.fraunces-breathe);
 * qui aggiungiamo solo .is-in al primo ingresso. Da usare su titoli che NON sono
 * già SplitLines, per non sovrapporre due animazioni.
 */
export function Breathe({
  children,
  className,
  as: Tag = 'span',
}: {
  children: ReactNode
  className?: string
  as?: ElementType
}) {
  const ref = useRef<HTMLElement>(null)

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
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const T = Tag as any
  return (
    <T ref={ref} className={className ? `fraunces-breathe ${className}` : 'fraunces-breathe'}>
      {children}
    </T>
  )
}
