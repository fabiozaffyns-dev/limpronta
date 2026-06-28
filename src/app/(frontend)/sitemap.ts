import type { MetadataRoute } from 'next'

import { getAllSlugs } from '@/lib/queries'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, lookbooks, pages] = await Promise.all([
    getAllSlugs('products'),
    getAllSlugs('brands'),
    getAllSlugs('lookbooks'),
    getAllSlugs('pages'),
  ])

  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/catalogo',
    '/marchi',
    '/lookbook',
    '/servizi',
    '/contatti',
  ].map((path) => ({ url: `${SITE}${path}`, lastModified: now, changeFrequency: 'weekly', priority: path === '' ? 1 : 0.8 }))

  const toEntry = (prefix: string, d: { slug?: string | null; updatedAt?: string | null }) => ({
    url: `${SITE}${prefix}/${d.slug}`,
    lastModified: d.updatedAt ? new Date(d.updatedAt) : now,
  })

  return [
    ...staticRoutes,
    ...products.filter((d) => d.slug).map((d) => toEntry('/catalogo', d)),
    ...brands.filter((d) => d.slug).map((d) => toEntry('/marchi', d)),
    ...lookbooks.filter((d) => d.slug).map((d) => toEntry('/lookbook', d)),
    ...pages.filter((d) => d.slug).map((d) => ({ url: `${SITE}/${d.slug}`, lastModified: d.updatedAt ? new Date(d.updatedAt) : now })),
  ]
}
