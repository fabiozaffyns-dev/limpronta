import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { Filters } from '@/components/Filters'
import { ProductCard } from '@/components/ProductCard'
import { GridStagger } from '@/components/motion/GridStagger'
import { PageIntro } from '@/components/ui/PageIntro'
import {
  getBrands,
  getCatalogFacets,
  getCategories,
  getProducts,
  type ProductFilters,
} from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Catalogo',
  description:
    "Il catalogo uomo de L'Impronta: capispalla, giacche, camicie, maglieria, calzature e accessori dei migliori brand. Filtra per brand, categoria, taglia e stagione.",
  // I filtri generano infinite varianti di query string: per Google è UNA pagina.
  alternates: { canonical: '/catalogo' },
}

type SP = Record<string, string | string[] | undefined>

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export default async function CatalogoPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams
  const pageRaw = Math.floor(Number(first(sp.page)))
  const filters: ProductFilters = {
    brand: first(sp.brand),
    categoria: first(sp.categoria),
    taglia: first(sp.taglia),
    colore: first(sp.colore),
    stagione: first(sp.stagione),
    q: first(sp.q),
    sort: first(sp.sort),
    page: Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1,
  }

  const [result, brands, categories, facets] = await Promise.all([
    getProducts(filters),
    getBrands(),
    getCategories(),
    getCatalogFacets(),
  ])

  const products = result.docs

  return (
    <>
      <PageIntro eyebrow="Collezione" titolo="Catalogo">
        Una selezione che cambia con le stagioni. Quello che vedi è disponibile in negozio: chiedici
        taglie, colori e abbinamenti.
      </PageIntro>

      <section className="shell pb-24">
        <Suspense fallback={<div className="h-24" />}>
          <Filters
            brands={brands.map((b) => ({ value: b.slug ?? '', label: b.nome }))}
            categories={categories.map((c) => ({ value: c.slug ?? '', label: c.nome }))}
            taglie={facets.taglie.map((t) => ({ value: t, label: t }))}
            colori={facets.colori.map((c) => ({ value: c, label: c }))}
          />
        </Suspense>

        <p className="cartellino mt-10 text-pietra-scura" aria-live="polite" role="status">
          {result.totalDocs} {result.totalDocs === 1 ? 'capo' : 'capi'}
        </p>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-display text-2xl text-inchiostro">Nessun capo corrisponde ai filtri.</p>
            <Link href="/catalogo" className="cartellino link-segno mt-4 inline-block text-ottone-testo">
              Azzera i filtri
            </Link>
          </div>
        ) : (
          <GridStagger className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </GridStagger>
        )}

        <Pagination
          page={result.page ?? 1}
          totalPages={result.totalPages}
          hasPrev={result.hasPrevPage}
          hasNext={result.hasNextPage}
          sp={sp}
        />
      </section>
    </>
  )
}

function Pagination({
  page,
  totalPages,
  hasPrev,
  hasNext,
  sp,
}: {
  page: number
  totalPages: number
  hasPrev: boolean
  hasNext: boolean
  sp: SP
}) {
  if (totalPages <= 1) return null
  const build = (p: number) => {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(sp)) {
      if (k === 'page') continue
      const val = first(v)
      if (val) params.set(k, val)
    }
    params.set('page', String(p))
    return `/catalogo?${params.toString()}`
  }
  return (
    <nav aria-label="Paginazione" className="mt-16 flex items-center justify-center gap-6">
      {hasPrev ? (
        <Link href={build(page - 1)} className="cartellino link-segno inline-flex min-h-[44px] items-center px-2 text-ottone-testo" scroll>
          ← Precedente
        </Link>
      ) : (
        <span className="cartellino inline-flex min-h-[44px] items-center px-2 text-pietra">← Precedente</span>
      )}
      <span className="cartellino text-pietra-scura">
        {page} / {totalPages}
      </span>
      {hasNext ? (
        <Link href={build(page + 1)} className="cartellino link-segno inline-flex min-h-[44px] items-center px-2 text-ottone-testo" scroll>
          Successiva →
        </Link>
      ) : (
        <span className="cartellino inline-flex min-h-[44px] items-center px-2 text-pietra">Successiva →</span>
      )}
    </nav>
  )
}
