'use client'

import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'

/**
 * Smooth scroll Lenis. Disattivato se l'utente preferisce meno movimento.
 * Aggiunge anche html.js (ridondante con lo script inline di layout, ma sicuro).
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // html.js è già aggiunto dallo script inline in layout (pre-paint).
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
