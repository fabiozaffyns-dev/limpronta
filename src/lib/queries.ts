import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'
import { cache } from 'react'

import type { Brand, Category, Lookbook, Media, Page, Product, Setting } from '@/payload-types'

import { firstSentence } from './lexical'
import { getPayloadClient } from './payload'
import { safeHref } from './sanitize'

const LOCALE = 'it' as const

// Tag unico per la Data Cache: invalidato on-demand dagli hook Payload
// (src/hooks/revalidate.ts) a ogni modifica di contenuti in admin. Serve
// soprattutto a /catalogo, che è dinamica (searchParams) e altrimenti pagherebbe
// brands+categorie+facets su Neon A OGNI richiesta.
const PAYLOAD_TAG = 'payload'

const published: Where = { _status: { equals: 'published' } }

// ─── Settings ────────────────────────────────────────────────────────────────
// cache() deduplica nel singolo render (layout + pagina); unstable_cache evita
// il giro su Neon a ogni richiesta delle rotte dinamiche.
export const getSettings = cache(
  unstable_cache(
    async (): Promise<Setting> => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug: 'settings', locale: LOCALE, depth: 1 })
    },
    ['settings'],
    { revalidate: 120, tags: [PAYLOAD_TAG] },
  ),
)

// ─── Brands ──────────────────────────────────────────────────────────────────
export const getBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'brands',
      locale: LOCALE,
      limit: 100,
      sort: ['ordine', 'nome'],
      depth: 1,
      pagination: false,
    })
    return res.docs
  },
  ['brands'],
  { revalidate: 120, tags: [PAYLOAD_TAG] },
)

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'brands',
    locale: LOCALE,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export type BrandIndexItem = {
  id: number
  nome: string
  slug: string
  sito: string | null
  foto: number | Media | null
  blurb: string
  count: number
}

/**
 * Indice marchi arricchito per la pagina "L'Indice Vivo": per ogni marchio una
 * foto-prodotto rappresentativa + il conteggio pezzi + un blurb. Solo 2 query
 * totali (brands + una find prodotti ridotta in memoria), niente N+1.
 */
export async function getBrandsIndex(): Promise<BrandIndexItem[]> {
  const payload = await getPayloadClient()
  const [brands, prods] = await Promise.all([
    getBrands(),
    payload.find({
      collection: 'products',
      locale: LOCALE,
      where: published,
      limit: 1000,
      depth: 1,
      pagination: false,
      sort: ['brand', 'ordine', 'nome'],
    }),
  ])

  const byBrand = new Map<number | string, { cover: number | Media | null; count: number }>()
  for (const p of prods.docs) {
    const brandId = typeof p.brand === 'object' && p.brand ? p.brand.id : p.brand
    if (brandId == null) continue
    const cover = p.immagini?.[0] ?? null
    const entry = byBrand.get(brandId)
    if (!entry) byBrand.set(brandId, { cover, count: 1 })
    else {
      entry.count += 1
      if (!entry.cover && cover) entry.cover = cover
    }
  }

  return brands.map((b) => {
    const agg = byBrand.get(b.id)
    return {
      id: b.id,
      nome: b.nome,
      slug: b.slug,
      sito: safeHref(b.sito) ?? null,
      foto: agg?.cover ?? null,
      blurb: firstSentence(b.descrizione),
      count: agg?.count ?? 0,
    }
  })
}

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'categories',
      locale: LOCALE,
      limit: 100,
      sort: 'ordine',
      depth: 0,
      pagination: false,
    })
    return res.docs
  },
  ['categories'],
  { revalidate: 120, tags: [PAYLOAD_TAG] },
)

// ─── Products ────────────────────────────────────────────────────────────────
export type ProductFilters = {
  brand?: string
  categoria?: string
  taglia?: string
  colore?: string
  stagione?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
}

export async function getProducts(filters: ProductFilters = {}) {
  const payload = await getPayloadClient()
  const and: Where[] = [published]

  if (filters.brand) and.push({ 'brand.slug': { equals: filters.brand } })
  if (filters.categoria) and.push({ 'categoria.slug': { equals: filters.categoria } })
  if (filters.taglia) and.push({ 'taglie.taglia': { equals: filters.taglia } })
  if (filters.colore) and.push({ 'colori.nome': { equals: filters.colore } })
  if (filters.stagione) and.push({ 'stagione.tipo': { equals: filters.stagione } })
  if (filters.q) {
    and.push({
      or: [{ nome: { like: filters.q } }, { sku: { like: filters.q } }],
    })
  }

  const sortMap: Record<string, string> = {
    novita: '-createdAt',
    'prezzo-asc': 'prezzo',
    'prezzo-desc': '-prezzo',
    nome: 'nome',
  }
  // Default: ordine manuale poi alfabetico. Le opzioni esplicite sovrascrivono.
  const sort: string | string[] =
    filters.sort && sortMap[filters.sort] ? sortMap[filters.sort]! : ['ordine', 'nome']

  return payload.find({
    collection: 'products',
    locale: LOCALE,
    where: { and },
    sort,
    page: filters.page ?? 1,
    limit: filters.limit ?? 24,
    depth: 1,
  })
}

/** Valori distinti di taglia e colore per i filtri del catalogo. */
export const getCatalogFacets = unstable_cache(
  async (): Promise<{ taglie: string[]; colori: string[] }> => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'products',
      locale: LOCALE,
      where: published,
      limit: 2000,
      depth: 0,
      pagination: false,
      // Solo i campi necessari: senza select la facet-scan caricava fino a
      // 2000 documenti prodotto INTERI a ogni richiesta del catalogo.
      select: { taglie: true, colori: true } as never,
    })
    const taglie = new Set<string>()
    const colori = new Set<string>()
    // Il cast serve perché `select` (as never) fa perdere il tipo dei docs.
    for (const p of res.docs as Product[]) {
      for (const t of p.taglie ?? []) if (t?.taglia) taglie.add(t.taglia)
      for (const c of p.colori ?? []) if (c?.nome) colori.add(c.nome)
    }
    return {
      taglie: [...taglie].sort((a, b) => a.localeCompare(b, 'it')),
      colori: [...colori].sort((a, b) => a.localeCompare(b, 'it')),
    }
  },
  ['catalog-facets'],
  { revalidate: 120, tags: [PAYLOAD_TAG] },
)

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    locale: LOCALE,
    where: { and: [published, { inEvidenza: { equals: true } }] },
    limit,
    depth: 1,
    sort: ['ordine', 'nome'],
  })
  return res.docs
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    locale: LOCALE,
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const payload = await getPayloadClient()
  const brandId = typeof product.brand === 'object' ? product.brand.id : product.brand
  const categoriaId = typeof product.categoria === 'object' ? product.categoria.id : product.categoria
  const res = await payload.find({
    collection: 'products',
    locale: LOCALE,
    where: {
      and: [
        published,
        { id: { not_equals: product.id } },
        { or: [{ categoria: { equals: categoriaId } }, { brand: { equals: brandId } }] },
      ],
    },
    limit,
    depth: 1,
    sort: '-updatedAt',
  })
  return res.docs
}

export async function getProductsByBrand(brandId: number | string, limit = 48): Promise<Product[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    locale: LOCALE,
    where: { and: [published, { brand: { equals: brandId } }] },
    limit,
    depth: 1,
    sort: ['ordine', 'nome'],
  })
  return res.docs
}

// ─── Lookbooks ───────────────────────────────────────────────────────────────
export async function getLookbooks(): Promise<Lookbook[]> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'lookbooks',
    locale: LOCALE,
    where: published,
    limit: 50,
    depth: 1,
    sort: '-createdAt',
  })
  return res.docs
}

export async function getLookbookBySlug(slug: string): Promise<Lookbook | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'lookbooks',
    locale: LOCALE,
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
  })
  return res.docs[0] ?? null
}

// ─── Pages ───────────────────────────────────────────────────────────────────
export async function getPageBySlug(slug: string): Promise<Page | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    locale: LOCALE,
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

// ─── Sitemap helpers ─────────────────────────────────────────────────────────
export async function getAllSlugs(collection: 'products' | 'brands' | 'lookbooks' | 'pages') {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection,
    locale: LOCALE,
    where: collection === 'brands' ? {} : published,
    limit: 1000,
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true } as never,
  })
  return res.docs as Array<{ slug?: string | null; updatedAt?: string | null }>
}
