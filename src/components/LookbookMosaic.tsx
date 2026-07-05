import { ParallaxMedia } from '@/components/motion/ParallaxMedia'
import { Reveal } from '@/components/motion/Reveal'
import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import { mediaDoc } from '@/lib/media'
import type { Media } from '@/payload-types'

type Img = number | Media

/**
 * Mosaico editoriale della galleria lookbook: righe componibili con scale
 * diverse — piena (orizzontale, con parallasse), coppia di orizzontali,
 * coppia di verticali, grande+piccola, trittico — scelte in base al FORMATO
 * reale delle foto e variate con un generatore pseudo-casuale SEEDED (stabile
 * per lookbook: l'SSR/ISR deve produrre sempre lo stesso layout, e il ritmo
 * non deve cambiare a ogni rigenerazione). Su mobile tutto in colonna, in ordine.
 */

type Row =
  | { tipo: 'piena'; img: Img }
  | { tipo: 'meta-orizzontali'; imgs: [Img, Img] }
  | { tipo: 'coppia'; imgs: [Img, Img] }
  | { tipo: 'sbilanciata'; imgs: [Img, Img]; grandeADestra: boolean }
  | { tipo: 'trittico'; imgs: [Img, Img, Img] }
  | { tipo: 'solo'; img: Img }

function isLandscape(img: Img): boolean {
  const doc = mediaDoc(img)
  return Boolean(doc?.width && doc?.height && doc.width > doc.height)
}

/** LCG deterministico: stesso seed → stessa sequenza (niente Math.random in RSC). */
function makeRnd(seed: string) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 233280
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildRows(images: Img[], seed: string): Row[] {
  const rnd = makeRnd(seed)
  const rows: Row[] = []
  let i = 0
  while (i < images.length) {
    const img = images[i]!
    if (isLandscape(img)) {
      const next = images[i + 1]
      // Due orizzontali di fila: a volte si affiancano a metà larghezza.
      if (next !== undefined && isLandscape(next) && rnd() < 0.45) {
        rows.push({ tipo: 'meta-orizzontali', imgs: [img, next] })
        i += 2
      } else {
        rows.push({ tipo: 'piena', img })
        i += 1
      }
      continue
    }
    // Verticali consecutive a partire da i.
    let run = 0
    while (i + run < images.length && !isLandscape(images[i + run]!)) run++
    if (run >= 3 && rnd() < 0.35) {
      rows.push({ tipo: 'trittico', imgs: [images[i]!, images[i + 1]!, images[i + 2]!] })
      i += 3
    } else if (run >= 2) {
      if (rnd() < 0.5) {
        rows.push({ tipo: 'sbilanciata', imgs: [images[i]!, images[i + 1]!], grandeADestra: rnd() < 0.5 })
      } else {
        rows.push({ tipo: 'coppia', imgs: [images[i]!, images[i + 1]!] })
      }
      i += 2
    } else {
      rows.push({ tipo: 'solo', img })
      i += 1
    }
  }
  return rows
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
  const rows = buildRows(images, seed)

  // priority solo sulla primissima foto (LCP della pagina); alt numerati
  // sull'ordine originale della galleria.
  const Foto = ({ img, aspect, sizes }: { img: Img; aspect: string; sizes: string }) => (
    <CloudinaryImage
      media={img}
      alt={`${titolo} — ${images.indexOf(img) + 1}`}
      aspect={aspect}
      sizes={sizes}
      priority={img === images[0]}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, r) => {
        switch (row.tipo) {
          case 'piena':
            return (
              <Reveal key={r}>
                <ParallaxMedia>
                  <Foto img={row.img} aspect="3 / 2" sizes="100vw" />
                </ParallaxMedia>
              </Reveal>
            )
          case 'meta-orizzontali':
            return (
              <Reveal key={r}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {row.imgs.map((img, j) => (
                    <Foto key={j} img={img} aspect="3 / 2" sizes="(max-width: 640px) 100vw, 50vw" />
                  ))}
                </div>
              </Reveal>
            )
          case 'coppia':
            return (
              <Reveal key={r}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {row.imgs.map((img, j) => (
                    <Foto key={j} img={img} aspect="4 / 5" sizes="(max-width: 640px) 100vw, 50vw" />
                  ))}
                </div>
              </Reveal>
            )
          case 'sbilanciata': {
            // Grande 7/12 + piccola 5/12: a schermo largo affiancate (la piccola
            // più stretta), su mobile impilate a tutta larghezza. Entrambe 4:5:
            // su mobile un 4:7 diventava altissimo (single column, ~700px).
            const [a, b] = row.imgs
            const grande = row.grandeADestra ? b : a
            const piccola = row.grandeADestra ? a : b
            return (
              <Reveal key={r}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className={cn(row.grandeADestra ? 'sm:order-2 sm:col-span-7' : 'sm:col-span-7')}>
                    <Foto img={grande} aspect="4 / 5" sizes="(max-width: 640px) 100vw, 58vw" />
                  </div>
                  <div className={cn(row.grandeADestra ? 'sm:order-1 sm:col-span-5' : 'sm:col-span-5')}>
                    <Foto img={piccola} aspect="4 / 5" sizes="(max-width: 640px) 100vw, 42vw" />
                  </div>
                </div>
              </Reveal>
            )
          }
          case 'trittico':
            return (
              <Reveal key={r}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {row.imgs.map((img, j) => (
                    <Foto key={j} img={img} aspect="4 / 5" sizes="(max-width: 640px) 100vw, 33vw" />
                  ))}
                </div>
              </Reveal>
            )
          case 'solo':
            return (
              <Reveal key={r}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className={cn(r % 2 === 1 && 'sm:col-start-2')}>
                    <Foto img={row.img} aspect="4 / 5" sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                </div>
              </Reveal>
            )
        }
      })}
    </div>
  )
}
