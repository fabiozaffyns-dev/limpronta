'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import { mediaDoc, mediaUrl } from '@/lib/media'
import type { Media } from '@/payload-types'

type Img = number | Media

/**
 * Galleria lookbook a MOSAICO "bento": celle di misure diverse che si incastrano
 * in una griglia densa. Le foto riempiono la cella (object-cover) e sono cliccabili
 * per aprirsi a SCHERMO INTERO (lightbox con avanti/indietro, Esc, swipe). Ogni
 * foto è incorniciata da un filo sottile in ottone (stampa montata). Le misure
 * sono guidate dal formato reale delle foto e variate con RNG seeded sullo slug
 * (stabile: SSR/ISR devono produrre sempre lo stesso layout).
 */

type Span = 'feature' | 'wide' | 'tall' | 'small'

const SPAN_CLASS: Record<Span, string> = {
  feature: 'col-span-2 row-span-2',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
  small: 'col-span-1 row-span-1',
}
const SPAN_SIZES: Record<Span, string> = {
  feature: '(max-width: 640px) 100vw, 50vw',
  wide: '(max-width: 640px) 100vw, 50vw',
  tall: '(max-width: 640px) 50vw, 25vw',
  small: '(max-width: 640px) 50vw, 25vw',
}

function isLandscape(img: Img): boolean {
  const doc = mediaDoc(img)
  return Boolean(doc?.width && doc?.height && doc.width > doc.height)
}

function makeRnd(seed: string) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildSpans(images: Img[], seed: string): Span[] {
  const rnd = makeRnd(seed)
  return images.map((img, i) => {
    if (i === 0) return 'feature'
    if (isLandscape(img)) return rnd() < 0.22 ? 'feature' : 'wide'
    const r = rnd()
    return r < 0.16 ? 'feature' : r < 0.6 ? 'tall' : 'small'
  })
}

export function LookbookMosaic({ images, seed, titolo }: { images: Img[]; seed: string; titolo: string }) {
  const spans = buildSpans(images, seed)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <div className="grid auto-rows-[8.5rem] grid-cols-2 gap-2.5 [grid-auto-flow:dense] sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-3.5">
        {images.map((img, i) => {
          const span = spans[i]!
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`Apri la foto ${i + 1} di ${images.length} a schermo intero`}
              className={cn(
                'group relative block cursor-zoom-in overflow-hidden border bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ottone',
                SPAN_CLASS[span],
              )}
              style={{
                borderColor: 'color-mix(in srgb, var(--color-ottone) 30%, transparent)',
                boxShadow: '0 10px 26px -18px rgba(28, 26, 23, 0.5)',
              }}
            >
              <CloudinaryImage
                media={img}
                alt={`${titolo} — ${i + 1}`}
                fillParent
                sizes={SPAN_SIZES[span]}
                priority={i === 0}
                imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
              />
              <span className="pointer-events-none absolute inset-0 bg-inchiostro/0 transition-colors duration-500 group-hover:bg-inchiostro/[0.06]" />
            </button>
          )
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          titolo={titolo}
          onClose={() => setOpenIndex(null)}
          onIndex={setOpenIndex}
        />
      )}
    </>
  )
}

function Lightbox({
  images,
  index,
  titolo,
  onClose,
  onIndex,
}: {
  images: Img[]
  index: number
  titolo: string
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const total = images.length
  const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex])
  const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex])

  // Tastiera (Esc / frecce) + blocco scroll del body mentre è aperto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('lenis-stopped')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [onClose, prev, next])

  // Swipe orizzontale su touch.
  const [touchX, setTouchX] = useState<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0]!.clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return
    const dx = e.changedTouches[0]!.clientX - touchX
    if (Math.abs(dx) > 45) (dx > 0 ? prev : next)()
    setTouchX(null)
  }

  const url = mediaUrl(images[index])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} di ${total} — ${titolo}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-inchiostro/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Chiudi */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center text-avorio/80 transition-colors hover:text-avorio"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
          <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" />
        </svg>
      </button>

      {/* Contatore */}
      <span className="cartellino absolute left-1/2 top-5 -translate-x-1/2 text-avorio/70">
        {index + 1} / {total}
      </span>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Foto precedente"
            className="absolute left-2 z-10 hidden h-12 w-12 items-center justify-center text-avorio/70 transition-colors hover:text-avorio sm:flex"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Foto successiva"
            className="absolute right-2 z-10 hidden h-12 w-12 items-center justify-center text-avorio/70 transition-colors hover:text-avorio sm:flex"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
        </>
      )}

      {/* Immagine (intera, non ritagliata) */}
      <div className="relative h-[86vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
        {url && (
          <Image
            key={index}
            src={url}
            alt={`${titolo} — ${index + 1}`}
            fill
            sizes="92vw"
            className="object-contain"
            priority
          />
        )}
      </div>
    </div>
  )
}
