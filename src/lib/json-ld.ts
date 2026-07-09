import type { Brand, Product, Setting } from '@/payload-types'

import { mediaUrl, rel } from './media'
import { SITE_URL as SITE } from './site'

// Coordinate del negozio: fallback se non valorizzate in Settings, così il
// blocco geo compare comunque nel LocalBusiness (aiuta local pack/Maps).
const STORE_GEO = { lat: 45.00662, lng: 7.53643 }

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

/** Telefono in E.164 (formato preferito per LocalBusiness). "011 6206975" → "+39 011 6206975". */
function telE164(tel?: string | null): string | undefined {
  if (!tel) return undefined
  const t = tel.trim()
  return t.startsWith('+') ? t : `+39 ${t}`
}

const GIORNI: Record<string, string> = {
  lun: 'Monday', mar: 'Tuesday', mer: 'Wednesday', gio: 'Thursday',
  ven: 'Friday', sab: 'Saturday', dom: 'Sunday',
}
const ORDINE = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

/** Espande "Mar – Sab" / "Lun" nella lista di giorni schema.org. */
function espandiGiorni(giorni?: string | null): string[] {
  if (!giorni) return []
  const parti = giorni.toLowerCase().split(/[–—-]/).map((s) => s.trim().slice(0, 3))
  if (parti.length === 2 && GIORNI[parti[0]!] && GIORNI[parti[1]!]) {
    const a = ORDINE.indexOf(parti[0]!)
    const b = ORDINE.indexOf(parti[1]!)
    if (a !== -1 && b !== -1 && a <= b) return ORDINE.slice(a, b + 1).map((g) => GIORNI[g]!)
  }
  return parti.map((p) => GIORNI[p]).filter((d): d is string => Boolean(d))
}

/** "9:30 – 12:30 / 16:00 – 19:30" → [["09:30","12:30"],["16:00","19:30"]]. */
function parseFasce(orario?: string | null): Array<[string, string]> {
  if (!orario) return []
  const hhmm = (s: string) => {
    const m = s.trim().match(/^(\d{1,2}):(\d{2})$/)
    return m ? `${m[1]!.padStart(2, '0')}:${m[2]}` : null
  }
  return orario
    .split('/')
    .map((f) => f.split(/[–—-]/).map((s) => s.trim()))
    .filter((p) => p.length === 2)
    .map(([a, b]) => [hhmm(a!), hhmm(b!)] as [string | null, string | null])
    .filter((p): p is [string, string] => Boolean(p[0] && p[1]))
}

/** Orari machine-readable per il LocalBusiness dal campo testo di Settings. */
function openingHours(settings: Setting) {
  const spec: Array<Record<string, unknown>> = []
  for (const riga of settings.orari ?? []) {
    if (riga.chiuso) continue
    const giorni = espandiGiorni(riga.giorni)
    const fasce = parseFasce(riga.orario)
    if (!giorni.length || !fasce.length) continue
    for (const [opens, closes] of fasce) {
      spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: giorni, opens, closes })
    }
  }
  return spec
}

/** LocalBusiness / ClothingStore per la home e i layout. */
export function clothingStoreLd(settings: Setting) {
  const social = [settings.social?.instagram, settings.social?.facebook].filter(Boolean)
  const lat = settings.mappa?.lat ?? STORE_GEO.lat
  const lng = settings.mappa?.lng ?? STORE_GEO.lng
  const orari = openingHours(settings)
  return {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    '@id': `${SITE}/#store`,
    name: "L'Impronta",
    legalName: settings.ragioneSociale ?? undefined,
    url: SITE,
    telephone: telE164(settings.telefono),
    email: settings.email ?? undefined,
    vatID: settings.partitaIva ?? undefined,
    // File statico in public/ (stesso disegno della route opengraph-image):
    // la route generata ha un hash nel nome, quindi non è referenziabile qui.
    image: `${SITE}/og.png`,
    address: postalAddress(settings),
    geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
    ...(orari.length ? { openingHoursSpecification: orari } : {}),
    ...(social.length ? { sameAs: social } : {}),
    priceRange: '€€€',
    areaServed: 'Orbassano, Torino e provincia',
  }
}

/** Nodo WebSite, collegato al negozio come publisher. */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: "L'Impronta",
    inLanguage: 'it-IT',
    publisher: { '@id': `${SITE}/#store` },
  }
}

/** ItemList dei prodotti di un marchio (pagina /marchi/[slug]). */
export function brandItemListLd(brand: Brand, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brand.nome} — L'Impronta`,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/catalogo/${p.slug}`,
      name: p.nome,
    })),
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
