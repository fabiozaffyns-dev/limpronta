import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import { mediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

type Img = number | Media

/**
 * Galleria lookbook a MOSAICO "bento": celle di misure diverse che si incastrano
 * in una griglia densa, senza spazi vuoti. Le foto riempiono la cella (object-cover,
 * quindi ritagliate) come nel riferimento richiesto. Ogni foto è incorniciata da
 * un filo sottile in ottone su fondo bianco (stampa montata). L'assegnazione delle
 * misure è guidata dal formato reale delle foto e variata con un generatore
 * pseudo-casuale SEEDED sullo slug: "random" ma stabile (SSR/ISR devono produrre
 * sempre lo stesso layout — niente Math.random in RSC).
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

/** LCG deterministico: stesso seed → stessa sequenza. */
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
    if (i === 0) return 'feature' // apertura sempre grande
    if (isLandscape(img)) return rnd() < 0.22 ? 'feature' : 'wide'
    // verticali: qualche cella alta, qualche piccola, di rado una grande
    const r = rnd()
    return r < 0.16 ? 'feature' : r < 0.6 ? 'tall' : 'small'
  })
}

export function LookbookMosaic({
  images,
  seed,
  titolo,
}: {
  images: Img[]
  seed: string
  titolo: string
}) {
  const spans = buildSpans(images, seed)

  return (
    <div className="grid auto-rows-[8.5rem] grid-cols-2 gap-2.5 [grid-auto-flow:dense] sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-3.5">
      {images.map((img, i) => {
        const span = spans[i]!
        return (
          <div
            key={i}
            className={cn('group relative overflow-hidden border bg-white', SPAN_CLASS[span])}
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
          </div>
        )
      })}
    </div>
  )
}
