'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Wordmark } from '@/components/ui/Wordmark'
import { cn } from '@/lib/cn'
import { appointmentMessage } from '@/lib/whatsapp'

gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText)

const SHADOW_LIGHT = '0 1px 0 rgba(255,255,255,0.5), 0 -1px 1px rgba(28,26,23,0.12)'
const SHADOW_DARK = '0 1px 1px rgba(0,0,0,0.55), 0 -1px 0 rgba(255,255,255,0.06)'

export type HeroMedia = { url: string; isVideo: boolean } | null

/**
 * Hero "momento orchestrato": le lettere del wordmark salgono una a una da
 * dietro una maschera, poi il segno si imprime. Se è impostato uno sfondo
 * (foto/video) passa in modalità scura: media + velo + wordmark chiaro, così
 * il segno non si perde. Senza JS / reduced-motion il testo è già al suo posto.
 */
export function DebossHero({
  whatsappNumber,
  heroMedia,
}: {
  whatsappNumber?: string | null
  heroMedia?: HeroMedia
}) {
  const root = useRef<HTMLElement>(null)
  const dark = Boolean(heroMedia?.url)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const markEl = root.current?.querySelector<HTMLElement>('[data-hero-mark]')
      let split: SplitText | null = null
      const targets =
        markEl && (split = new SplitText(markEl, { type: 'chars', mask: 'chars' })).chars

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-eyebrow]', { y: 22, autoAlpha: 0, duration: 0.8 }, 0)

      if (targets && targets.length) {
        tl.from(
          targets,
          { yPercent: 135, filter: 'blur(14px)', stagger: 0.06, duration: 1.3, ease: 'expo.out' },
          0.2,
        )
      } else {
        tl.from('[data-hero-mark]', { yPercent: 40, autoAlpha: 0, duration: 1.1 }, 0.2)
      }

      tl.fromTo(
        '[data-hero-word]',
        { scaleY: 1.08 },
        { scaleY: 1, duration: 0.5, ease: 'power4.out' },
        '-=0.4',
      )
        .fromTo(
          '[data-hero-mark]',
          { textShadow: '0 0 0 rgba(0,0,0,0)' },
          { textShadow: dark ? SHADOW_DARK : SHADOW_LIGHT, duration: 0.5, ease: 'power2.out' },
          '<',
        )
        .from('[data-hero-tag]', { y: 22, autoAlpha: 0, duration: 0.85 }, '-=0.2')
        .from('[data-hero-cta] > *', { y: 16, autoAlpha: 0, stagger: 0.13, duration: 0.65 }, '-=0.45')
        .from('[data-hero-scroll]', { autoAlpha: 0, y: -6, duration: 0.9 }, '-=0.15')

      gsap.to('[data-hero-word]', {
        yPercent: -6,
        autoAlpha: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })

      return () => split?.revert()
    },
    { scope: root, dependencies: [dark] },
  )

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {dark && heroMedia && (
        <div aria-hidden className="absolute inset-0">
          {heroMedia.isVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
              src={heroMedia.url}
            />
          ) : (
            <Image src={heroMedia.url} alt="" fill priority sizes="100vw" className="object-cover" />
          )}
          {/* Velo scuro: il wordmark resta leggibile, il media resta elegante */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(28,26,23,0.55) 0%, rgba(28,26,23,0.48) 45%, rgba(28,26,23,0.62) 100%)',
            }}
          />
        </div>
      )}

      <div data-hero-eyebrow className="relative">
        <Eyebrow as="div" scuro={dark}>
          Boutique uomo · Orbassano · dal 2014
        </Eyebrow>
      </div>

      <h1 className="relative mt-10">
        <span data-hero-word className="inline-block will-change-transform">
          <Wordmark data-hero-mark scuro={dark} className="block text-[clamp(3.75rem,17vw,13.5rem)]" />
        </span>
      </h1>

      <p
        data-hero-tag
        className={cn(
          'relative mt-10 max-w-xl text-lg leading-relaxed md:text-xl',
          dark ? 'text-avorio/85' : 'text-pietra-scura',
        )}
      >
        Il segno lasciato nella materia pregiata. Una selezione sartoriale di marchi scelti — si
        guarda, si tocca, si prenota in negozio.
      </p>

      <div data-hero-cta className="relative mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link href="/catalogo" className={cn('btn', dark ? 'btn-loden' : 'btn-primario')}>
          Esplora il catalogo
        </Link>
        <WhatsAppButton
          number={whatsappNumber}
          message={appointmentMessage()}
          label="Prenota in negozio"
          variant={dark ? 'chiaro' : 'ghost'}
        />
      </div>

      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className={cn('cartellino', dark ? 'text-avorio/80' : 'text-pietra-scura')}>Scorri</span>
        <span
          aria-hidden
          className="block h-12 w-px"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-ottone) 55%, transparent)' }}
        />
      </div>
    </section>
  )
}
