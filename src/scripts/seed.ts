import config from '@payload-config'
import { getPayload } from 'payload'

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
      titolo: 'Privacy Policy',
      sommario: 'Informativa sul trattamento dei dati personali ai sensi del Reg. UE 2016/679 (GDPR).',
      contenuto: paragraphs(
        'BOZZA — DA FAR VALIDARE LEGALMENTE.',
        'Il presente documento è un modello di partenza e deve essere verificato e adattato da un consulente legale prima della pubblicazione definitiva.',
        '## Titolare del trattamento',
        'Titolare del trattamento è L’Impronta di Zaffino Fabio, P.IVA 11162620014, Via Vittorio Emanuele II 12/A, 10043 Orbassano (TO). Per esercitare i tuoi diritti puoi contattarci ai recapiti indicati nella pagina Contatti.',
        '## Dati trattati e finalità',
        'Trattiamo i dati che ci fornisci tramite il modulo di contatto (nome, email, telefono, messaggio) al solo fine di rispondere alle tue richieste. Non vendiamo né cediamo i tuoi dati a terzi per finalità di marketing.',
        '## Destinatari e fornitori di servizi',
        'Per il funzionamento del sito ci avvaliamo di fornitori che possono trattare dati per nostro conto: Formspree Inc. (recapito dei messaggi del modulo di contatto, USA), Vercel Inc. (hosting del sito, USA), Cloudinary Ltd. (distribuzione delle immagini) e Stadia Maps (mappa interattiva, caricata solo previo consenso). I trasferimenti verso paesi extra-UE avvengono sulla base delle garanzie previste dal GDPR (EU-US Data Privacy Framework o Clausole Contrattuali Standard).',
        '## Base giuridica e conservazione',
        'La base giuridica è il riscontro alla tua richiesta (misure precontrattuali) e, ove applicabile, il consenso. I dati sono conservati per il tempo necessario a gestire la richiesta e adempiere agli obblighi di legge.',
        '## Diritti dell’interessato',
        'Hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei dati, oltre al diritto di reclamo al Garante per la protezione dei dati personali.',
      ),
    },
    {
      slug: 'cookie-policy',
      titolo: 'Cookie Policy',
      sommario: 'Informativa sull’uso dei cookie e delle tecnologie di tracciamento.',
      contenuto: paragraphs(
        'BOZZA — DA FAR VALIDARE LEGALMENTE.',
        'Il presente documento è un modello di partenza e deve essere verificato e adattato da un consulente legale prima della pubblicazione definitiva.',
        '## Cosa sono i cookie',
        'I cookie sono piccoli file salvati sul tuo dispositivo. Questo sito usa cookie tecnici necessari al funzionamento e, previo consenso, cookie statistici anonimi.',
        '## Cookie tecnici',
        'Sono indispensabili per la navigazione e la sicurezza del sito e non richiedono consenso.',
        '## Cookie statistici (previo consenso)',
        'Utilizziamo strumenti di analisi anonimi (Vercel Analytics) per capire come viene usato il sito. Questi strumenti si attivano solo dopo il tuo consenso, prestato tramite il banner. Puoi modificare la scelta in qualsiasi momento dal pulsante “Cookie” in basso a sinistra.',
        '## Servizi di terze parti',
        'Le immagini sono distribuite tramite Cloudinary. La mappa del negozio (Stadia Maps) viene caricata solo dopo il consenso o un tuo click esplicito: fino a quel momento nessun dato raggiunge il fornitore.',
      ),
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
