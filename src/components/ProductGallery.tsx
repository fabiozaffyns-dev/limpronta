'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState } from 'react'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import { prefersReduced } from '@/lib/motion'
import type { MediaLike } from '@/lib/media'

export function ProductGallery({ images, nome }: { images: MediaLike[]; nome: string }) {
  const [active, setActive] = useState(0)
  const main = images.length ? images[Math.min(active, images.length - 1)] : null
  const stage = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  // Crossfade morbido al cambio immagine (non sul primo render, per non
  // penalizzare l'LCP). Il key={active} rimonta l'immagine principale.
  useGSAP(
    () => {
      if (prefersReduced()) return
      if (first.current) {
        first.current = false
        return
      }
      const img = stage.current?.querySelector('img')
      if (!img) return
      gsap.fromTo(
        img,
        { autoAlpha: 0, scale: 1.03 },
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
      )
    },
    { dependencies: [active], scope: stage },
  )

  return (
    <div className="flex flex-col gap-4">
      <div ref={stage}>
        <CloudinaryImage
          key={active}
          media={main}
          alt={nome}
          aspect="3 / 4"
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Mostra immagine ${i + 1} di ${images.length}`}
              aria-current={i === active}
              className={cn(
                'overflow-hidden border transition-colors duration-300',
                i === active ? 'border-ottone' : 'border-transparent hover:border-pietra',
              )}
            >
              <CloudinaryImage media={img} alt="" aspect="1 / 1" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
