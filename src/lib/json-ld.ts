import type { Product, Setting } from '@/payload-types'

import { formatPrice } from './format'
import { mediaUrl, rel } from './media'

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

function postalAddress(settings: Setting) {
  const a = settings.indirizzo
  return {
    '@type': 'PostalAddress',
    streetAddress: [a?.via, a?.civico].filter(Boolean).join(' '),
    postalCode: a?.cap ?? undefined,
    addressLocality: a?.citta ?? 'Orbassano',
    addressRegion: a?.provincia ?? 'TO',
    addressCountry: 'IT',
  }
}

/** LocalBusiness / ClothingStore per la home e i layout. */
export function clothingStoreLd(settings: Setting) {
  const social = [settings.social?.instagram, settings.social?.facebook].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE}/#store`,
    name: "L'Impronta",
    legalName: settings.ragioneSociale ?? undefined,
    url: SITE,
    telephone: settings.telefono ?? undefined,
    vatID: settings.partitaIva ?? undefined,
    image: `${SITE}/opengraph-image`,
    address: postalAddress(settings),
    ...(settings.mappa?.lat && settings.mappa?.lng
      ? { geo: { '@type': 'GeoCoordinates', latitude: settings.mappa.lat, longitude: settings.mappa.lng } }
      : {}),
    ...(social.length ? { sameAs: social } : {}),
    priceRange: '€€€',
    areaServed: 'Orbassano, Torino e provincia',
  }
}

/** Product per le schede prodotto. */
export function productLd(product: Product, settings: Setting) {
  const brand = rel<{ nome?: string }>(product.brand)
  const img = (product.immagini ?? [])
    .map((m) => mediaUrl(m))
    .filter((u): u is string => Boolean(u))

  const offerPrice = !product.prezzoSuRichiesta && product.prezzo != null ? product.prezzo : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nome,
    sku: product.sku,
    ...(brand?.nome ? { brand: { '@type': 'Brand', name: brand.nome } } : {}),
    ...(img.length ? { image: img } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      ...(offerPrice != null ? { price: offerPrice } : {}),
      availability: product.disponibile
        ? 'https://schema.org/InStock'
        : 'https://schema.org/LimitedAvailability',
      availableAtOrFrom: { '@type': 'ClothingStore', name: "L'Impronta", telephone: settings.telefono ?? undefined },
      description: product.prezzoSuRichiesta ? formatPrice(null, true) : undefined,
    },
  }
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  }
}
