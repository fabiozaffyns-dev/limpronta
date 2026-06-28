'use client'

import { useState } from 'react'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
import type { MediaLike } from '@/lib/media'

export function ProductGallery({ images, nome }: { images: MediaLike[]; nome: string }) {
  const [active, setActive] = useState(0)
  const main = images.length ? images[Math.min(active, images.length - 1)] : null

  return (
    <div className="flex flex-col gap-4">
      <CloudinaryImage
        media={main}
        alt={nome}
        aspect="3 / 4"
        sizes="(max-width: 1024px) 100vw, 55vw"
        priority
      />

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
