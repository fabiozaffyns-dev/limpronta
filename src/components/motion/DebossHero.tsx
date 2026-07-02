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
import { SwapLabel } from '@/components/ui/SwapLabel'
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
      let tagSplit: SplitText | null = null
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
        .from('[data-hero-cta] > *', { y: 16, autoAlpha: 0, stagger: 0.13, duration: 0.65 }, '-=0.45')
        .from('[data-hero-scroll]', { autoAlpha: 0, y: -6, duration: 0.9 }, '-=0.15')

      // La tagline si SROTOLA da sola ~1s dopo il load (non al primo scroll):
      // righe che salgono una alla volta da dietro una maschera (SplitText).
      // Pre-nascosta via CSS (html.js [data-hero-tag]) per evitare flash.
      const tagEl = root.current?.querySelector<HTMLElement>('[data-hero-tag]')
      const t0 = performance.now()
      if (tagEl) {
        void document.fonts.ready.then(() => {
          if (!root.current) return
          tagSplit = new SplitText(tagEl, { type: 'words', mask: 'words' })
          const ritardo = Math.max(0, 1 - (performance.now() - t0) / 1000)
          gsap.set(tagEl, { autoAlpha: 1 })
          gsap.from(tagSplit.words, {
            yPercent: 120,
            autoAlpha: 0,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.085,
            delay: ritardo,
          })
        })
      }

      // ── "IL CONIO" — lo sprofondo del sigillo ──────────────────────────────
      // Pin + scrub: l'UI si ritira, il wordmark si serra e affonda (deboss),
      // una lama di luce ottone lo attraversa, poi una lastra di Lino sale da
      // sotto e le STESSE lettere diventano l'impronta scura su carta chiara,
      // consegnando senza stacco al Muro dei marchi. Solo transform/opacity/
      // clip-path (GPU); ease 'none' (lo scrub È il tempo); ampiezze micro.
      // Segnala alla Header quando la lastra di Lino ha riempito lo schermo
      // (progress > 0.8): è LO STATO REALE della scena, non un'euristica sugli
      // eventi scroll (che al primo load emettevano transitori fuorvianti).
      let heroFine = false
      const segnala = (fine: boolean) => {
        // Stato SEMPRE leggibile (window.__heroFine): la Header lo rilegge nei
        // primi secondi, così nessuna race (Ctrl+R, navigazioni) può perdersi.
        ;(window as unknown as { __heroFine?: boolean }).__heroFine = fine
        if (fine === heroFine) return
        heroFine = fine
        window.dispatchEvent(new CustomEvent('impronta:hero-fine', { detail: fine }))
      }

      const conio = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          pinSpacing: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Check per-frame sul ticker già attivo (Lenis): legge il progress REALE
      // e segnala solo al cambio. Copre ogni race (refresh, navigazioni,
      // scrollTo del wordmark) che un singolo onUpdate può perdere.
      const tickCheck = () => segnala((conio.scrollTrigger?.progress ?? 0) > 0.8)
      gsap.ticker.add(tickCheck)

      // BEAT 1 — ritiro UI: resta solo il segno. fromTo con start esplicito +
      // immediateRender:false → il fade arriva DAVVERO a 0 (niente cattura pigra
      // del valore iniziale), così su lino chiaro non resta la tagline chiara.
      conio
        .fromTo('[data-hero-scroll]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -6, duration: 0.06, immediateRender: false }, 0)
        .fromTo('[data-hero-eyebrow]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -14, duration: 0.12, immediateRender: false }, 0.02)
        .fromTo('[data-hero-tag]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 16, duration: 0.12, immediateRender: false }, 0.04)
        .fromTo('[data-hero-cta]', { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 24, duration: 0.12, immediateRender: false }, 0.06)
        .to('[data-hero-veil]', { opacity: 0.9, duration: 0.18 }, 0)

      // BEAT 2 — la serratura + l'affondo: il conio si arma e morde la materia.
      conio.to(
        '[data-hero-word]',
        { scale: 0.965, yPercent: 3, transformOrigin: '50% 56%', duration: 0.34 },
        0.16,
      )

      // BEAT 3 — il foglio sale DIETRO + inversione tinta: le lettere diventano
      // impronta scura su carta chiara (stesso nodo, nessun clone da allineare).
      conio
        .to('[data-hero-sheet]', { clipPath: 'inset(0% 0 0 0)', duration: 0.42 }, 0.4)
        .to('[data-hero-media]', { yPercent: -6, duration: 0.42 }, 0.4)
        .to('[data-mark-light]', { opacity: 0, duration: 0.2 }, 0.56)
        .to('[data-mark-dark]', { opacity: 1, duration: 0.2 }, 0.56)

      // BEAT 4 — la lama di luce ottone: un solo passaggio sull'incisione.
      conio.fromTo('[data-hero-rake]', { '--rake': '-40%' }, { '--rake': '140%', duration: 0.2 }, 0.78)

      // BEAT 5 — settle: micro-rilascio, l'impronta "respira" e consegna.
      conio
        .to('[data-hero-word]', { scale: 0.972, yPercent: 1, duration: 0.14 }, 0.86)
        .to('[data-mark-dark]', { opacity: 0.96, duration: 0.14 }, 0.86)

      // Ricalcola le misure del pin dopo i font (evita salti d'altezza).
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())

      return () => {
        gsap.ticker.remove(tickCheck)
        ;(window as unknown as { __heroFine?: boolean }).__heroFine = false
        split?.revert()
        tagSplit?.revert()
      }
    },
    { scope: root, dependencies: [dark] },
  )

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {dark && heroMedia && (
        <>
          <div data-hero-media aria-hidden className="absolute inset-0 z-0">
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
            {/* Velo scuro: vignettatura (centro più chiaro, bordi scuri) + gradiente
               verticale. Tiene il wordmark leggibile e dà profondità al media. */}
            <div
              data-hero-veil
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 90% at 50% 42%, rgba(20,18,16,0.35) 0%, rgba(20,18,16,0.62) 100%), linear-gradient(180deg, rgba(20,18,16,0.62) 0%, rgba(20,18,16,0.55) 45%, rgba(20,18,16,0.8) 100%)',
              }}
            />
          </div>
          {/* La lastra di Lino: il "foglio premuto". A riposo è chiusa dal basso
             (clip-path), sale durante il colpo e diventa il fondo chiaro della
             pagina — stesso colore del Muro dei marchi → raccordo senza stacco. */}
          <div
            data-hero-sheet
            aria-hidden
            className="absolute inset-0 z-[1] bg-lino"
            style={{ clipPath: 'inset(100% 0 0 0)', willChange: 'clip-path' }}
          />
        </>
      )}

      <div data-hero-eyebrow className="relative z-[2]">
        <Eyebrow as="div" scuro={dark}>
          Abbigliamento uomo · Orbassano · dal 2014
        </Eyebrow>
      </div>

      <h1 className="relative z-[2] mt-10">
        <span data-hero-word className="grid will-change-transform">
          {/* (A) copia CHIARA — visibile a riposo (avorio su scuro). È quella che
              l'intro anima (SplitText) e che porta il segno fino al colpo. */}
          <Wordmark
            data-hero-mark
            data-mark-light
            scuro={dark}
            className="col-start-1 row-start-1 block text-[clamp(3.75rem,17vw,13.5rem)] [grid-area:1/1]"
          />
          {/* (B) copia SCURA — l'impronta (inchiostro + deboss su chiaro). A riposo
              invisibile; appare quando la lastra di Lino la raggiunge. */}
          <Wordmark
            aria-hidden
            data-mark-dark
            className="pointer-events-none col-start-1 row-start-1 block text-[clamp(3.75rem,17vw,13.5rem)] opacity-0 [grid-area:1/1]"
          />
          {/* (C) copia RAKE — solo la lama di luce ottone (CSS: clip:text + screen). */}
          <Wordmark
            aria-hidden
            data-hero-rake
            className="pointer-events-none col-start-1 row-start-1 block text-[clamp(3.75rem,17vw,13.5rem)] [grid-area:1/1]"
          />
        </span>
      </h1>

      <p
        data-hero-tag
        className={cn(
          'relative z-[2] mt-10 max-w-xl text-lg leading-relaxed md:text-xl',
          dark ? 'text-avorio/85' : 'text-pietra-scura',
        )}
      >
        Il segno lasciato nella materia pregiata. Una selezione di marchi scelti — si
        guarda, si tocca, si prenota in negozio.
      </p>

      <div data-hero-cta className="relative z-[2] mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link href="/catalogo" className={cn('btn', dark ? 'btn-ottone' : 'btn-primario')}>
          <SwapLabel>Esplora il catalogo</SwapLabel>
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
        className="absolute bottom-8 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-3"
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
