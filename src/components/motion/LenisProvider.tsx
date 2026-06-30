'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll Lenis AGGANCIATO a ScrollTrigger su un solo RAF (gsap.ticker):
 * è il telaio del ritmo, così ogni effetto scrubbato (parallax) segue lo smooth
 * scroll senza scatti. Disattivato se l'utente preferisce meno movimento.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // html.js è già aggiunto dallo script inline in layout (pre-paint).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      // lerp = interpolazione continua verso il target: scroll più "setoso" e
      // fluido di duration+easing (che riparte ad ogni tacca della rotella).
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    // Bridge: ogni scroll di Lenis aggiorna ScrollTrigger; un unico ticker guida
    // il raf di Lenis (niente loop concorrenti).
    lenis.on('scroll', ScrollTrigger.update)
    const onTick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    // Posizioni corrette con Lenis attivo.
    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(onTick)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
      ScrollTrigger.refresh()
    }
  }, [])

  return <>{children}</>
}
