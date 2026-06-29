'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Link from 'next/link'
import { useRef } from 'react'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Wordmark } from '@/components/ui/Wordmark'
import { appointmentMessage } from '@/lib/whatsapp'

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText)

// Allineato al token .incisa di globals.css.
const DEBOSS_SHADOW = '0 1px 0 rgba(255,255,255,0.5), 0 -1px 1px rgba(28,26,23,0.12)'

/**
 * Hero "momento orchestrato": le lettere del wordmark salgono una a una da
 * dietro una maschera, poi il segno si imprime (deboss). Il logo È il wordmark.
 * Senza JS / reduced-motion il testo è già al suo posto (graceful degradation).
 */
export function DebossHero({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const markEl = root.current?.querySelector<HTMLElement>('[data-hero-mark]')
      let split: SplitText | null = null
      const targets =
        markEl && (split = new SplitText(markEl, { type: 'chars', mask: 'chars' })).chars

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-eyebrow]', { y: 18, autoAlpha: 0, duration: 0.7 }, 0)

      if (targets && targets.length) {
        tl.from(
          targets,
          { yPercent: 118, duration: 1.05, stagger: 0.045, ease: 'power4.out' },
          0.25,
        )
      } else {
        tl.from('[data-hero-mark]', { yPercent: 30, autoAlpha: 0, duration: 1 }, 0.25)
      }

      tl.fromTo(
        '[data-hero-mark]',
        { textShadow: '0 0 0 rgba(0,0,0,0)' },
        { textShadow: DEBOSS_SHADOW, duration: 0.9, ease: 'power2.out' },
        '-=0.35',
      )
        .from('[data-hero-tag]', { y: 18, autoAlpha: 0, duration: 0.8 }, '-=0.5')
        .from('[data-hero-cta] > *', { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.6 }, '-=0.4')
        .from('[data-hero-scroll]', { autoAlpha: 0, duration: 0.9 }, '-=0.2')

      // Parallax + dissolvenza del wordmark allo scroll.
      gsap.to('[data-hero-word]', {
        yPercent: -6,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      return () => split?.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div data-hero-eyebrow className="relative">
        <Eyebrow as="div">Boutique uomo · Orbassano · dal 2014</Eyebrow>
      </div>

      <h1 className="relative mt-10">
        <span data-hero-word className="inline-block will-change-transform">
          <Wordmark data-hero-mark className="block text-[clamp(3.75rem,17vw,13.5rem)]" />
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
        <span
          aria-hidden
          className="block h-12 w-px"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-ottone) 55%, transparent)' }}
        />
      </div>
    </section>
  )
}
