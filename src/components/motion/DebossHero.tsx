'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useRef } from 'react'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Sigillo } from '@/components/ui/Sigillo'
import { Wordmark } from '@/components/ui/Wordmark'
import { appointmentMessage } from '@/lib/whatsapp'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const DEBOSS_SHADOW = '0 1px 0 rgba(255,255,255,0.55), 0 -1px 1px rgba(28,26,23,0.2)'

/**
 * Hero "momento orchestrato": il wordmark si imprime sul fondo materico,
 * eyebrow/sottotitolo/CTA salgono in cascata, leggero Ken Burns + parallax.
 * Senza JS o con reduced-motion il contenuto è già al suo posto (graceful).
 */
export function DebossHero({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-hero-eyebrow]', { y: 20, autoAlpha: 0, duration: 0.7 })
        .from(
          '[data-hero-word]',
          { scale: 1.05, autoAlpha: 0, filter: 'blur(7px)', duration: 1.1 },
          '-=0.3',
        )
        .fromTo(
          '[data-hero-word]',
          { textShadow: '0 0 0 rgba(0,0,0,0)' },
          { textShadow: DEBOSS_SHADOW, duration: 0.6 },
          '-=0.45',
        )
        .from('[data-hero-sub]', { y: 18, autoAlpha: 0, duration: 0.7 }, '-=0.5')
        .from('[data-hero-cta] > *', { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.6 }, '-=0.4')
        .from('[data-hero-aside]', { autoAlpha: 0, x: 24, duration: 1 }, 0.2)
        .from('[data-hero-img]', { scale: 1.12, duration: 1.8, ease: 'power2.out' }, 0)

      gsap.to('[data-hero-img]', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative flex min-h-[100svh] items-center overflow-hidden pt-24">
      <div className="shell grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div data-hero-eyebrow>
            <Eyebrow>Boutique uomo · Orbassano · dal 2014</Eyebrow>
          </div>
          <h1 className="mt-6">
            <Wordmark data-hero-word className="block text-[clamp(3.5rem,12vw,9rem)]" />
          </h1>
          <p data-hero-sub className="mt-6 max-w-md text-lg leading-relaxed text-pietra-scura">
            Il segno lasciato nella materia pregiata. Una selezione sartoriale di marchi scelti, con
            il consiglio di chi conosce ogni capo. Si guarda, si tocca, si prenota in negozio.
          </p>
          <div data-hero-cta className="mt-10 flex flex-wrap items-center gap-4">
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
        </div>

        <div data-hero-aside className="relative hidden lg:block">
          <div
            data-hero-img
            className="placeholder-materico shadow-[0_30px_80px_-40px_rgba(28,26,23,0.5)]"
            style={{ aspectRatio: '4 / 5' }}
            role="img"
            aria-label="Immagine editoriale in arrivo"
          />
          <div className="absolute -bottom-6 -left-6">
            <Sigillo size={72} />
          </div>
        </div>
      </div>
    </section>
  )
}
