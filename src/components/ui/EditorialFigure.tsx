import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { mediaDoc, type MediaLike } from '@/lib/media'

/**
 * Immagine editoriale con hover "wow": zoom lento e cinematografico e un velo
 * caldo. Funziona sia con una foto reale (CloudinaryImage) sia col pannello
 * materico di fallback. Tutto CSS (group-hover), nessun JS.
 */
export function EditorialFigure({
  media,
  alt,
  aspect,
  label,
  sizes = '(max-width: 1024px) 100vw, 50vw',
}: {
  media: MediaLike
  alt: string
  aspect: string
  label?: string
  sizes?: string
}) {
  const hasImg = Boolean(mediaDoc(media))
  const zoom =
    'transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]'

  return (
    <figure className="group relative overflow-hidden">
      {hasImg ? (
        <CloudinaryImage
          media={media}
          alt={alt}
          aspect={aspect}
          sizes={sizes}
          className="w-full"
          imgClassName={zoom}
        />
      ) : (
        <div className={`placeholder-materico w-full ${zoom}`} style={{ aspectRatio: aspect }} />
      )}

      {/* velo caldo all'hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-inchiostro/0 transition-colors duration-500 group-hover:bg-inchiostro/[0.08]"
      />

      {label && (
        <figcaption className="cartellino absolute bottom-4 left-4 bg-lino/85 px-2 py-1 text-inchiostro backdrop-blur-sm">
          {label}
        </figcaption>
      )}
    </figure>
  )
}
