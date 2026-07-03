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
import { slugify } from '../lib/slugify'

/**
 * Seed idempotente: categorie, marchi, servizi, impostazioni, primo admin e
 * pagine (chi siamo + legali). Rieseguibile senza creare duplicati.
 *   pnpm seed
 */

const CATEGORIES: { nome: string; sizeType: string }[] = [
  { nome: 'Capispalla', sizeType: 'alpha' },
  { nome: 'Giacche', sizeType: 'alpha' },
  { nome: 'Camicie', sizeType: 'alpha' },
  { nome: 'Maglieria', sizeType: 'alpha' },
  { nome: 'Pantaloni', sizeType: 'numeric_eu' },
  { nome: 'Jeans', sizeType: 'numeric_eu' },
  { nome: 'Polo/T-shirt', sizeType: 'alpha' },
  { nome: 'Calzature', sizeType: 'shoe_eu' },
  { nome: 'Accessori', sizeType: 'one_size' },
  { nome: 'Cerimonia', sizeType: 'alpha' },
]

const BRANDS = [
  'Corneliani',
  'Harmont&Blaine',
  'Mastai Ferretti',
  'Gallo',
  'Alessandro Gilles',
  'Diadora Heritage',
  'Minoronzoni 1953',
  'Ishikawa',
  'Canadiens',
  'Shockly',
  'SP1',
  'Valsport',
  'Replay',
  'Reebok Classic',
  'Suns',
  'SUN68',
  '40WEFT',
  'Homeward',
  'AT.P.CO',
]


async function main() {
  console.log('— Seed L’Impronta: avvio —')
  const payload = await getPayload({ config })
  const log = (s: string) => console.log(s)

  log('Payload pronto, inizio seed…')

  // Categorie
  let catCreate = 0
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i]!
    const slug = slugify(c.nome)
    const exists = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (exists.docs.length === 0) {
      await payload.create({
        collection: 'categories',
        locale: 'it',
        data: { nome: c.nome, slug, ordine: i, sizeType: c.sizeType as 'alpha' },
      })
      catCreate++
    }
  }
  log(`Categorie: ${catCreate} create, ${CATEGORIES.length - catCreate} già presenti`)

  // Marchi
  let brandCreate = 0
  for (let i = 0; i < BRANDS.length; i++) {
    const nome = BRANDS[i]!
    const slug = slugify(nome)
    const exists = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    if (exists.docs.length === 0) {
      // ordine=0 (default) → i marchi si mostrano in ordine alfabetico finché
      // non si imposta un ordine manuale dall'admin.
      await payload.create({ collection: 'brands', locale: 'it', data: { nome, slug } })
      brandCreate++
    }
  }
  log(`Marchi: ${brandCreate} creati, ${BRANDS.length - brandCreate} già presenti`)


  // Pagine (chi siamo + legali)
  const PAGES = [
    {
      slug: 'chi-siamo',
      titolo: 'Chi siamo',
      sommario:
        'L’Impronta nasce a Orbassano nel 2014: un negozio di abbigliamento uomo dove la selezione conta più dell’assortimento.',
      contenuto: paragraphs(
        'Dal 2014 vestiamo l’uomo di Orbassano e della provincia di Torino con una selezione pensata, non accumulata. Crediamo che un capo valga per come è fatto, per il tessuto, per il modo in cui cade addosso a chi lo indossa.',
        '## La nostra idea di stile',
        'Eleganza non vuol dire vetrina: vuol dire coerenza. Scegliamo marchi che condividono una stessa cura sartoriale e li accostiamo perché dialoghino tra loro. Il risultato è un guardaroba che dura, stagione dopo stagione.',
        '## Il servizio',
        'In negozio trovi consiglio vero: ti ascoltiamo, proviamo, suggeriamo. Su misura, consulenza d’immagine e personal shopping completano un modo di lavorare fatto di relazione e attenzione.',
        'Ti aspettiamo in Via Vittorio Emanuele II 12/A. Si guarda, si tocca, si prenota in negozio.',
      ),
    },
    {
      slug: 'privacy',
      titolo: PRIVACY_TITOLO,
      sommario: PRIVACY_SOMMARIO,
      contenuto: paragraphs(...PRIVACY_PARTS),
    },
    {
      slug: 'cookie-policy',
      titolo: COOKIE_TITOLO,
      sommario: COOKIE_SOMMARIO,
      contenuto: paragraphs(...COOKIE_PARTS),
    },
  ]

  let pageCreate = 0
  for (const p of PAGES) {
    const exists = await payload.find({ collection: 'pages', where: { slug: { equals: p.slug } }, limit: 1, depth: 0 })
    if (exists.docs.length === 0) {
      await payload.create({
        collection: 'pages',
        locale: 'it',
        data: {
          titolo: p.titolo,
          slug: p.slug,
          sommario: p.sommario,
          contenuto: p.contenuto,
          _status: 'published',
        },
      })
      pageCreate++
    }
  }
  log(`Pagine: ${pageCreate} create, ${PAGES.length - pageCreate} già presenti`)

  // Impostazioni (solo se non ancora configurate).
  // Nota: telefono/indirizzo hanno defaultValue, quindi controllo gli ORARI
  // (senza default) per capire se il global è già stato popolato.
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0 })
  if (!settings.orari || settings.orari.length === 0) {
    await payload.updateGlobal({
      slug: 'settings',
      locale: 'it',
      data: {
        ragioneSociale: "L'Impronta di Zaffino Fabio",
        partitaIva: '11162620014',
        indirizzo: { via: 'Via Vittorio Emanuele II', civico: '12/A', cap: '10043', citta: 'Orbassano', provincia: 'TO' },
        telefono: '011 6206975',
        social: {
          instagram: 'https://www.instagram.com/limpronta_abbigliamento',
          facebook: 'https://www.facebook.com/limprontaabbigliamento.uomo',
        },
        orari: [
          { giorni: 'Lun', orario: '', chiuso: true },
          { giorni: 'Mar – Sab', orario: '9:30 – 12:30 / 16:00 – 19:30' },
          { giorni: 'Dom', orario: '', chiuso: true },
        ],
      },
    })
    log('Impostazioni: valori predefiniti applicati')
  } else {
    log('Impostazioni: già configurate, nessuna modifica')
  }

  // Primo amministratore. NIENTE password di default scritta nel repo:
  // senza SEED_ADMIN_PASSWORD il seed si ferma con un errore chiaro.
  const users = await payload.find({ collection: 'users', limit: 1, depth: 0 })
  if (users.docs.length === 0) {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@limpronta.it'
    const password = process.env.SEED_ADMIN_PASSWORD
    if (!password) {
      throw new Error(
        'SEED_ADMIN_PASSWORD mancante: imposta una password nel .env prima di creare il primo admin.',
      )
    }
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Fabio', role: 'admin' },
    })
    log(`Admin creato: ${email}`)
  } else {
    log('Utenti: già presenti, nessun admin creato')
  }

  // Verifica conteggi effettivi a DB
  const counts = {
    categorie: (await payload.count({ collection: 'categories' })).totalDocs,
    marchi: (await payload.count({ collection: 'brands' })).totalDocs,
    pagine: (await payload.count({ collection: 'pages' })).totalDocs,
    utenti: (await payload.count({ collection: 'users' })).totalDocs,
  }
  console.log('VERIFICA conteggi a DB:', JSON.stringify(counts))
  log('— Seed completato —')

}

// Top-level await: tiene vivo il processo sotto `payload run` finché il seed
// non è davvero finito (un main() "fire-and-forget" usciva prima del tempo).
try {
  await main()
  process.exit(0)
} catch (err) {
  console.error('SEED ERRORE:', err)
  process.exit(1)
}
