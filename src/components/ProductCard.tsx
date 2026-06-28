import Link from 'next/link'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { cn } from '@/lib/cn'
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
  const prezzo = formatPrice(product.prezzo, product.prezzoSuRichiesta)
  const stagione = formatStagione(product.stagione)

  return (
    <Link href={`/catalogo/${product.slug}`} className="group block">
      <div className="relative overflow-hidden">
        <CloudinaryImage
          media={cover}
          alt={product.nome}
          aspect="3 / 4"
          sizes={sizes}
          priority={priority}
          imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
        />
        {/* overlay sottile all'hover */}
        <span className="pointer-events-none absolute inset-0 bg-inchiostro/0 transition-colors duration-500 group-hover:bg-inchiostro/5" />

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
        {brand?.nome && <p className="cartellino text-ottone">{brand.nome}</p>}
        <h3 className="font-display mt-1 text-lg leading-snug text-inchiostro transition-colors duration-300 group-hover:text-loden">
          {product.nome}
        </h3>
        <p className={cn('cartellino mt-2 text-pietra-scura')}>{prezzo}</p>
      </div>
    </Link>
  )
}
