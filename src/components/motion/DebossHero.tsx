'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Wordmark } from '@/components/ui/Wordmark'
import { appointmentMessage } from '@/lib/whatsapp'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// Allineato al token .incisa di globals.css.
const DEBOSS_SHADOW = '0 1px 0 rgba(255,255,255,0.5), 0 -1px 1px rgba(28,26,23,0.12)'

/**
 * Hero "momento orchestrato": il wordmark si imprime nel fondo materico dentro
 * una cornice d'ottone. Apertura cinematografica con GSAP; senza JS / con
 * reduced-motion resta statico e leggibile (graceful degradation).
 */
export function DebossHero({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-frame]', { scale: 1.03, autoAlpha: 0, duration: 1.3, ease: 'power2.out' })
        .from('[data-hero-eyebrow]', { y: 16, autoAlpha: 0, duration: 0.7 }, 0.25)
        .from(
          '[data-hero-word]',
          { y: 30, scale: 1.05, autoAlpha: 0, filter: 'blur(9px)', duration: 1.25 },
          0.35,
        )
        .fromTo(
          '[data-hero-mark]',
          { textShadow: '0 0 0 rgba(0,0,0,0)' },
          { textShadow: DEBOSS_SHADOW, duration: 0.7 },
          '-=0.55',
        )
        .from('[data-hero-tag]', { y: 16, autoAlpha: 0, duration: 0.7 }, '-=0.45')
        .from('[data-hero-cta] > *', { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, '-=0.35')
        .from('[data-hero-scroll]', { autoAlpha: 0, duration: 0.8 }, '-=0.1')

      // Parallax + dissolvenza del wordmark allo scroll.
      gsap.to('[data-hero-word]', {
        yPercent: -6,
        autoAlpha: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* Cornice d'ottone (atelier) */}
      <div
        data-hero-frame
        aria-hidden
        className="pointer-events-none absolute inset-4 md:inset-8"
        style={{ border: '1px solid color-mix(in srgb, var(--color-ottone) 36%, transparent)' }}
      />

      <div data-hero-eyebrow className="relative">
        <Eyebrow as="div">Boutique uomo · Orbassano · dal 2014</Eyebrow>
      </div>

      <h1 className="relative mt-10">
        <span data-hero-word className="inline-block will-change-transform">
          <Wordmark data-hero-mark className="block text-[clamp(3.75rem,17vw,13rem)]" />
        </span>
      </h1>

      <p
        data-hero-tag
        className="relative mt-10 max-w-xl text-lg leading-relaxed text-pietra-scura md:text-xl"
      >
        Il segno lasciato nella materia pregiata. Una selezione sartoriale di marchi scelti — si
        guarda, si tocca, si prenota in negozio.
      </p>

      <div data-hero-cta className="relative mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link href="/catalogo" className="btn btn-primario">
          Esplora il catalogo
        </Link>
        <WhatsAppButton
          number={whatsappNumber}
          message={appointmentMessage()}
          label="Prenota in negozio"
          variant="ghost"
        />
      </div>

      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="cartellino text-pietra-scura">Scorri</span>
        <span aria-hidden className="block h-12 w-px" style={{ backgroundColor: 'color-mix(in srgb, var(--color-ottone) 55%, transparent)' }} />
      </div>
    </section>
  )
}
