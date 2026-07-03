import type { Product, Setting } from '@/payload-types'

import { mediaUrl, rel } from './media'
import { SITE_URL as SITE } from './site'

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
    email: settings.email ?? undefined,
    vatID: settings.partitaIva ?? undefined,
    // File statico in public/ (stesso disegno della route opengraph-image):
    // la route generata ha un hash nel nome, quindi non è referenziabile qui.
    image: `${SITE}/og.png`,
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
    url: `${SITE}/catalogo/${product.slug}`,
    // Un'Offer senza price è structured data invalido: per i capi "su richiesta"
    // (o senza prezzo) si omette del tutto il blocco offers.
    ...(offerPrice != null
      ? {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: offerPrice,
            availability: product.disponibile
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            availableAtOrFrom: { '@type': 'ClothingStore', name: "L'Impronta", telephone: settings.telefono ?? undefined },
          },
        }
      : {}),
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
