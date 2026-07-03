import Link from 'next/link'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { formatPrice, formatStagione } from '@/lib/format'
import { rel } from '@/lib/media'
import type { Brand, Product } from '@/payload-types'

export function ProductCard({
  product,
  priority = false,
  sizes = '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw',
}: {
  product: Product
  priority?: boolean
  sizes?: string
}) {
  const brand = rel<Brand>(product.brand)
  const cover = product.immagini?.[0]
  const coverHover = product.immagini?.[1] // se esiste: "seconda pelle" in crossfade all'hover
  const prezzo = formatPrice(product.prezzo, product.prezzoSuRichiesta)
  const stagione = formatStagione(product.stagione)

  return (
    <Link href={`/catalogo/${product.slug}`} className="card-lift group relative block">
      <div className="relative overflow-hidden">
        <CloudinaryImage
          media={cover}
          alt={product.nome}
          aspect="3 / 4"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
        {/* Seconda pelle: la 2ª foto affiora all'hover (lazy, solo se esiste). */}
        {coverHover && (
          <CloudinaryImage
            media={coverHover}
            alt=""
            fillParent
            sizes={sizes}
            className="card-hover-img"
            imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
        )}
        {/* overlay sottile all'hover */}
        <span className="pointer-events-none absolute inset-0 bg-inchiostro/0 transition-colors duration-500 group-hover:bg-inchiostro/5" />
        {/* filo d'ottone che si traccia all'hover (sostituisce le crop-marks) */}
        <span aria-hidden className="card-filo" />

        {stagione && (
          <span className="cartellino absolute left-3 top-3 bg-lino/85 px-2 py-1 text-pietra-scura backdrop-blur-sm">
            {stagione}
          </span>
        )}
        {!product.disponibile && (
          <span className="cartellino absolute right-3 top-3 bg-inchiostro/85 px-2 py-1 text-avorio">
            Non disp.
          </span>
        )}
      </div>

      <div className="mt-4">
        {brand?.nome && <p className="cartellino text-ottone-testo">{brand.nome}</p>}
        <h3 className="font-display mt-1 line-clamp-2 min-h-[2.75em] text-lg uppercase leading-snug text-inchiostro transition-colors duration-300 group-hover:text-ottone-testo">
          {product.nome}
        </h3>
        {prezzo && <p className="cartellino mt-2 text-pietra-scura">{prezzo}</p>}
      </div>
    </Link>
  )
}
