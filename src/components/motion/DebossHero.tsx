'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

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
 * Trasformazioni Cloudinary per il VIDEO hero (il loader custom copre solo le
 * immagini): qualità/codec automatici + larghezza limitata invece del file
 * originale intero, e un poster (primo frame) che dipinge subito l'hero senza
 * aspettare il download del video.
 */
function cloudinaryVideo(url: string): { src: string; poster?: string } {
  const marker = '/upload/'
  const i = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || i === -1) return { src: url }
  const head = url.slice(0, i + marker.length)
  const tail = url.slice(i + marker.length)
  if (tail.startsWith('q_auto')) return { src: url }
  return {
    src: `${head}q_auto,vc_auto,w_1600/${tail}`,
    poster: `${head}so_0,q_auto,f_auto,w_1600/${tail.replace(/\.[a-z0-9]+$/i, '.jpg')}`,
  }
}

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
  const video = heroMedia?.isVideo ? cloudinaryVideo(heroMedia.url) : null
  const videoRef = useRef<HTMLVideoElement>(null)

  // Il video di sfondo va SEMPRE in loop (nessun controllo pausa/play). Unica
  // eccezione: chi ha attivo prefers-reduced-motion vede il poster fermo —
  // invisibile per tutti gli altri, non intacca l'esperienza normale.
  useEffect(() => {
    const v = videoRef.current
    if (v && window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause()
  }, [])

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
          tagEl.style.animation = 'none' // disinnesca la rivelazione CSS di scorta
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
        split?.revert()
        tagSplit?.revert()
      }
    },
    { scope: root, dependencies: [dark] },
  )

  return (
    <>
      {/* Sentinello per la Header: elemento invisibile ancorato alla CIMA del
         documento (fuori dalla section, quindi NON segue il pin). Finché è in
         viewport (IntersectionObserver) la header resta trasparente; sparisce a
         ~96svh di scroll ≈ quando la lastra di Lino ha riempito lo schermo.
         Nessun evento scroll, nessno stato JS: è il browser a dire dove siamo. */}
      <div
        data-hero-sentinella
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: '96svh',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {dark && heroMedia && (
        <>
          <div data-hero-media aria-hidden className="absolute inset-0 z-0">
            {video ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                poster={video.poster}
                className="h-full w-full object-cover"
                src={video.src}
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
          Abbigliamento uomo · Orbassano · dal{' '}2014
        </Eyebrow>
      </div>

      <h1 className="relative z-[2] mt-6 sm:mt-10">
        <span data-hero-word className="grid will-change-transform">
          {/* (A) copia CHIARA — visibile a riposo (avorio su scuro). È quella che
              l'intro anima (SplitText) e che porta il segno fino al colpo. */}
          <Wordmark
            data-hero-mark
            data-mark-light
            scuro={dark}
            className="col-start-1 row-start-1 block wordmark-hero [grid-area:1/1]"
          />
          {/* (B) copia SCURA — l'impronta (inchiostro + deboss su chiaro). A riposo
              invisibile; appare quando la lastra di Lino la raggiunge. */}
          <Wordmark
            aria-hidden
            data-mark-dark
            className="pointer-events-none col-start-1 row-start-1 block wordmark-hero opacity-0 [grid-area:1/1]"
          />
          {/* (C) copia RAKE — solo la lama di luce ottone (CSS: clip:text + screen). */}
          <Wordmark
            aria-hidden
            data-hero-rake
            className="pointer-events-none col-start-1 row-start-1 block wordmark-hero [grid-area:1/1]"
          />
        </span>
      </h1>

      <p
        data-hero-tag
        className={cn(
          'relative z-[2] mt-6 max-w-xl text-lg leading-relaxed sm:mt-10 md:text-xl',
          dark ? 'text-avorio/85' : 'text-pietra-scura',
        )}
      >
        Il segno lasciato nella materia pregiata. Una selezione di marchi scelti — si
        guarda, si tocca, si prenota in negozio.
      </p>

      <div data-hero-cta className="relative z-[2] mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-12">
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
        className="absolute bottom-8 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className={cn('cartellino', dark ? 'text-avorio/80' : 'text-pietra-scura')}>Scorri</span>
        {/* Traccia tenue + "seme" di luce ottone che scende in loop (il cue di
           scroll). Statico e pieno con reduced-motion (vedi globals.css). */}
        <span aria-hidden className="hero-scroll-line relative block h-12 w-px overflow-hidden">
          <span
            className="hero-scroll-bead absolute inset-x-0 top-0 block h-4"
            style={{ backgroundColor: dark ? 'var(--color-ottone-chiaro)' : 'var(--color-ottone)' }}
          />
        </span>
      </div>
    </section>
    </>
  )
}
