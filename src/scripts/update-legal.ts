import config from '@payload-config'
import { getPayload } from 'payload'

import {
  COOKIE_PARTS,
  COOKIE_SOMMARIO,
  COOKIE_TITOLO,
  PRIVACY_PARTS,
  PRIVACY_SOMMARIO,
  PRIVACY_TITOLO,
} from '../lib/legal-content'
import { paragraphs } from '../lib/lexical'

/**
 * Sovrascrive i contenuti delle pagine legali (privacy, cookie-policy) con i
 * testi definitivi di src/lib/legal-content.ts. Serve perché il seed è
 * idempotente e NON riscrive le pagine già esistenti: senza questo, le versioni
 * "BOZZA" già a DB resterebbero pubblicate. Rieseguibile.
 *   node --env-file=.env --import tsx/esm src/scripts/update-legal.ts
 */

const PAGES = [
  { slug: 'privacy', titolo: PRIVACY_TITOLO, sommario: PRIVACY_SOMMARIO, contenuto: paragraphs(...PRIVACY_PARTS) },
  { slug: 'cookie-policy', titolo: COOKIE_TITOLO, sommario: COOKIE_SOMMARIO, contenuto: paragraphs(...COOKIE_PARTS) },
]

async function main() {
  const payload = await getPayload({ config })
  for (const p of PAGES) {
    const found = await payload.find({ collection: 'pages', where: { slug: { equals: p.slug } }, limit: 1, depth: 0 })
    const doc = found.docs[0]
    if (!doc) {
      console.log(`✗ Pagina "${p.slug}" non trovata: eseguire prima il seed.`)
      continue
    }
    await payload.update({
      collection: 'pages',
      id: doc.id,
      locale: 'it',
      data: { titolo: p.titolo, sommario: p.sommario, contenuto: p.contenuto, _status: 'published' },
    })
    console.log(`✓ Aggiornata e pubblicata: /${p.slug}`)
  }
  console.log('— Testi legali aggiornati —')
  process.exit(0)
}

void main()
