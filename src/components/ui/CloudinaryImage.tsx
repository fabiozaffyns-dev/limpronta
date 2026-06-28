import Image from 'next/image'

import { cn } from '@/lib/cn'
import { mediaAlt, mediaUrl, type MediaLike } from '@/lib/media'

type Props = {
  media: MediaLike
  alt?: string
  sizes?: string
  className?: string
  imgClassName?: string
  priority?: boolean
  /** Aspect ratio CSS, es. "3 / 4" (verticale moda), "4 / 5", "16 / 9". */
  aspect?: string
  /** Riempie il contenitore genitore (che deve essere position:relative). */
  fillParent?: boolean
}

/**
 * Immagine ottimizzata (loader Cloudinary). Se la media manca, mostra un
 * placeholder materico elegante — il design è photo-forward ma non si rompe
 * senza foto reali.
 */
export function CloudinaryImage({
  media,
  alt,
  sizes = '100vw',
  className,
  imgClassName,
  priority = false,
  aspect = '3 / 4',
  fillParent = false,
}: Props) {
  const url = mediaUrl(media)
  const altText = alt ?? mediaAlt(media, '')
  const boxStyle = fillParent ? undefined : { aspectRatio: aspect }

  if (!url) {
    return (
      <div
        className={cn('placeholder-materico', fillParent ? 'absolute inset-0' : null, className)}
        style={boxStyle}
        role="img"
        aria-label={altText || 'Immagine in arrivo'}
      />
    )
  }

  return (
    <div
      className={cn('overflow-hidden bg-lino-scuro', fillParent ? 'absolute inset-0' : 'relative', className)}
      style={boxStyle}
    >
      <Image
        src={url}
        alt={altText}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', imgClassName)}
      />
    </div>
  )
}
