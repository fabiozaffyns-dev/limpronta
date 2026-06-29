import config from '@payload-config'
import { mkdtempSync } from 'fs'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'
import sharp from 'sharp'

import { paragraphs } from '../lib/lexical'
import { slugify } from '../lib/slugify'

/**
 * Contenuti DEMO: prodotti + lookbook con immagini placeholder eleganti
 * generate nei colori del brand (non foto stock). Idempotente.
 *   pnpm demo          → popola
 *   pnpm demo:clear    → rimuove (SKU che iniziano con DEMO-, media e lookbook [demo])
 *
 * Marcatori per la pulizia: SKU "DEMO-*", alt media "[demo] *", titolo lookbook con " [demo]".
 */

const PALETTES = [
  { bg: '#3A4A2C', accent: '#E6DFD1' }, // Loden / Lino
  { bg: '#1C1A17', accent: '#9E7E45' }, // Inchiostro / Ottone
  { bg: '#D9D0BF', accent: '#3A4A2C' }, // Lino scuro / Loden
  { bg: '#5E574C', accent: '#EFE9DD' }, // Pietra scura / Lino
  { bg: '#262320', accent: '#b9965b' }, // Inchiostro tenue / Ottone chiaro
  { bg: '#6b5226', accent: '#F2ECE0' }, // Ottone scuro / Avorio
]

type Demo = {
  sku: string
  nome: string
  brand: string
  categoria: string
  prezzo?: number
  suRichiesta?: boolean
  taglie: string[]
  colori: string[]
  stagione: { tipo: 'PE' | 'AI'; anno: number }
  inEvidenza?: boolean
  descrizione: string
  pi: number // indice palette
}

const PRODUCTS: Demo[] = [
  { sku: 'DEMO-GIA-01', nome: 'Giacca destrutturata in lino', brand: 'Corneliani', categoria: 'Giacche', prezzo: 690, taglie: ['48', '50', '52', '54'], colori: ['Blu', 'Sabbia'], stagione: { tipo: 'PE', anno: 2025 }, inEvidenza: true, descrizione: 'Monopetto destrutturato in puro lino, spalla morbida e linea naturale. Un capo che respira con chi lo indossa.', pi: 0 },
  { sku: 'DEMO-CAM-01', nome: 'Camicia sartoriale lavata', brand: 'Mastai Ferretti', categoria: 'Camicie', prezzo: 150, taglie: ['S', 'M', 'L', 'XL'], colori: ['Celeste', 'Bianco'], stagione: { tipo: 'PE', anno: 2025 }, descrizione: 'Cotone lavato dal tatto vissuto, collo francese, vestibilità regolare. Da indossare dentro o fuori dai pantaloni.', pi: 2 },
  { sku: 'DEMO-POL-01', nome: 'Polo in piqué di cotone', brand: 'Harmont&Blaine', categoria: 'Polo/T-shirt', prezzo: 120, taglie: ['S', 'M', 'L', 'XL', 'XXL'], colori: ['Navy', 'Bianco', 'Verde'], stagione: { tipo: 'PE', anno: 2025 }, inEvidenza: true, descrizione: 'La polo iconica in piqué, ricamo a contrasto e taglio pulito. Un classico che non tradisce.', pi: 1 },
  { sku: 'DEMO-MAG-01', nome: 'Girocollo in lino e cotone', brand: 'Gallo', categoria: 'Maglieria', prezzo: 180, taglie: ['46', '48', '50', '52'], colori: ['Tabacco', 'Antracite'], stagione: { tipo: 'PE', anno: 2025 }, descrizione: 'Maglia leggera in misto lino, mano fresca e colori pieni. Il jolly delle mezze stagioni.', pi: 3 },
  { sku: 'DEMO-PAN-01', nome: 'Chino in cotone stretch', brand: 'Alessandro Gilles', categoria: 'Pantaloni', prezzo: 160, taglie: ['46', '48', '50', '52', '54'], colori: ['Beige', 'Blu', 'Verde oliva'], stagione: { tipo: 'PE', anno: 2025 }, descrizione: 'Chino dalla gamba affusolata, cotone con un tocco di elasticità per il comfort di tutti i giorni.', pi: 5 },
  { sku: 'DEMO-JEA-01', nome: 'Jeans selvedge cimosa', brand: 'SP1', categoria: 'Jeans', prezzo: 210, taglie: ['30', '31', '32', '33', '34', '36'], colori: ['Indaco'], stagione: { tipo: 'AI', anno: 2025 }, descrizione: 'Denim selvedge a cimosa, peso pieno e tinta indaco profonda. Invecchia bene, come deve.', pi: 1 },
  { sku: 'DEMO-CAL-01', nome: 'Sneaker in pelle', brand: 'Diadora Heritage', categoria: 'Calzature', prezzo: 230, taglie: ['40', '41', '42', '43', '44', '45'], colori: ['Bianco', 'Sabbia'], stagione: { tipo: 'PE', anno: 2025 }, inEvidenza: true, descrizione: 'Sneaker low in pelle pieno fiore, suola in gomma e dettagli heritage. Pulita, versatile, italiana.', pi: 2 },
  { sku: 'DEMO-CAP-01', nome: 'Field jacket idrorepellente', brand: 'Canadiens', categoria: 'Capispalla', suRichiesta: true, taglie: ['M', 'L', 'XL'], colori: ['Verde militare', 'Navy'], stagione: { tipo: 'AI', anno: 2025 }, descrizione: 'Field jacket dal taglio funzionale, tessuto idrorepellente e tasche generose. Per la città e oltre.', pi: 0 },
  { sku: 'DEMO-MAG-02', nome: 'Cardigan in pura lana', brand: 'Minoronzoni 1953', categoria: 'Maglieria', prezzo: 290, taglie: ['48', '50', '52', '54'], colori: ['Cammello', 'Grigio'], stagione: { tipo: 'AI', anno: 2025 }, descrizione: 'Cardigan in lana corposa, bottoni in corozo e maglia che tiene la forma. Il calore con stile.', pi: 4 },
  { sku: 'DEMO-CER-01', nome: 'Abito cerimonia tre pezzi', brand: 'Corneliani', categoria: 'Cerimonia', suRichiesta: true, taglie: ['48', '50', '52', '54', '56'], colori: ['Blu notte', 'Grigio perla'], stagione: { tipo: 'PE', anno: 2025 }, inEvidenza: true, descrizione: 'Abito tre pezzi per le occasioni che contano. Tessuti nobili e linea impeccabile, su appuntamento.', pi: 1 },
  { sku: 'DEMO-POL-02', nome: 'T-shirt in cotone pettinato', brand: 'Shockly', categoria: 'Polo/T-shirt', prezzo: 70, taglie: ['S', 'M', 'L', 'XL'], colori: ['Bianco', 'Nero', 'Grigio'], stagione: { tipo: 'PE', anno: 2025 }, descrizione: 'Girocollo essenziale in cotone pettinato, mano morbida e tenuta del colore. La base di tutto.', pi: 3 },
  { sku: 'DEMO-PAN-02', nome: 'Pantalone sartoriale in lana fresca', brand: 'Ishikawa', categoria: 'Pantaloni', prezzo: 240, taglie: ['46', '48', '50', '52', '54'], colori: ['Antracite', 'Blu'], stagione: { tipo: 'AI', anno: 2025 }, descrizione: 'Pantalone dalla piega netta in lana fresca, cadute pulite e comfort sartoriale. Eleganza quotidiana.', pi: 5 },
]

const LOOKBOOKS = [
  { titolo: 'Lino e leggerezza [demo]', tipo: 'PE' as const, anno: 2025, intro: 'Una stagione di tessuti che respirano: lino, cotoni lavati, colori di terra e di cielo. Il guardaroba dell’uomo che non rinuncia mai alla naturalezza.', n: 6, pi0: 0 },
  { titolo: 'Materia e calore [demo]', tipo: 'AI' as const, anno: 2025, intro: 'Lane corpose, capispalla funzionali, toni profondi. L’inverno raccontato attraverso la mano dei materiali e la precisione del taglio.', n: 6, pi0: 1 },
]

function xmlEsc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function svg(bg: string, accent: string, label: string, w: number, h: number) {
  const cx = w / 2
  const main = xmlEsc(label.toUpperCase())
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="v" cx="50%" cy="42%" r="85%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#1C1A17" stop-opacity="0.42"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${accent}" stroke-opacity="0.3" stroke-width="1"/>
  <text x="${cx}" y="${h * 0.5}" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(w * 0.052)}" fill="${accent}" fill-opacity="0.92" text-anchor="middle" dominant-baseline="middle" letter-spacing="${Math.round(w * 0.004)}">${main}</text>
  <text x="${cx}" y="${h * 0.9}" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(w * 0.019)}" fill="${accent}" fill-opacity="0.6" text-anchor="middle" letter-spacing="${Math.round(w * 0.013)}">L'IMPRONTA</text>
</svg>`
}

async function main() {
  const payload = await getPayload({ config })
  const action = process.argv[2] ?? 'seed'
  const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'limpronta-demo-'))

  // ── CLEAR ───────────────────────────────────────────────────────────────
  if (action === 'clear') {
    const dp = await payload.delete({ collection: 'products', where: { sku: { like: 'DEMO-' } } })
    const dl = await payload.delete({ collection: 'lookbooks', where: { titolo: { like: '[demo]' } } })
    const dm = await payload.delete({ collection: 'media', where: { alt: { like: '[demo]' } } })
    const n = (x: { docs?: unknown[] }) => (Array.isArray(x.docs) ? x.docs.length : 0)
    console.log(`Demo rimossi → prodotti ${n(dp)}, lookbook ${n(dl)}, media ${n(dm)}`)
    process.exit(0)
  }

  // ── SEED ────────────────────────────────────────────────────────────────
  let imgN = 0
  async function makeMedia(pi: number, label: string, w: number, h: number): Promise<number | string> {
    const p = PALETTES[pi % PALETTES.length]!
    const buf = await sharp(Buffer.from(svg(p.bg, p.accent, label, w, h))).png().toBuffer()
    const file = path.join(tmpDir, `demo-${imgN++}.png`)
    await sharp(buf).toFile(file)
    const m = await payload.create({ collection: 'media', data: { alt: `[demo] ${label}` }, filePath: file })
    return m.id
  }

  const brandId = async (nome: string) =>
    (await payload.find({ collection: 'brands', where: { slug: { equals: slugify(nome) } }, limit: 1, depth: 0 })).docs[0]?.id
  const catId = async (nome: string) =>
    (await payload.find({ collection: 'categories', where: { slug: { equals: slugify(nome) } }, limit: 1, depth: 0 })).docs[0]?.id

  let created = 0
  let skipped = 0
  for (const d of PRODUCTS) {
    const exists = await payload.find({ collection: 'products', where: { sku: { equals: d.sku } }, limit: 1, depth: 0 })
    if (exists.docs[0]) {
      skipped++
      continue
    }
    const bId = await brandId(d.brand)
    const cId = await catId(d.categoria)
    if (!bId || !cId) {
      console.log(`Salto ${d.sku}: marchio/categoria non trovati (esegui prima pnpm seed)`)
      continue
    }
    const img1 = await makeMedia(d.pi, d.brand, 900, 1200)
    const img2 = await makeMedia(d.pi + 2, d.nome, 900, 1200)
    await payload.create({
      collection: 'products',
      locale: 'it',
      data: {
        nome: d.nome,
        sku: d.sku,
        brand: bId,
        categoria: cId,
        descrizione: paragraphs(d.descrizione),
        prezzo: d.suRichiesta ? undefined : d.prezzo,
        prezzoSuRichiesta: Boolean(d.suRichiesta),
        taglie: d.taglie.map((t) => ({ taglia: t, disponibile: true })),
        colori: d.colori.map((c) => ({ nome: c })),
        stagione: d.stagione,
        immagini: [img1, img2],
        inEvidenza: Boolean(d.inEvidenza),
        disponibile: true,
        _status: 'published',
      } as never,
    })
    created++
    console.log(`+ ${d.sku} ${d.nome}`)
  }

  let lbCreated = 0
  for (const lb of LOOKBOOKS) {
    const exists = await payload.find({ collection: 'lookbooks', where: { titolo: { equals: lb.titolo } }, limit: 1, depth: 0 })
    if (exists.docs[0]) continue
    const imgs: (number | string)[] = []
    for (let i = 0; i < lb.n; i++) {
      const wide = i === 0 || i % 5 === 4
      imgs.push(await makeMedia(lb.pi0 + i, `${lb.tipo} ${lb.anno}`, wide ? 1600 : 900, wide ? 900 : 1200))
    }
    await payload.create({
      collection: 'lookbooks',
      locale: 'it',
      data: {
        titolo: lb.titolo,
        stagione: { tipo: lb.tipo, anno: lb.anno },
        descrizione: paragraphs(lb.intro),
        immagini: imgs,
        _status: 'published',
      } as never,
    })
    lbCreated++
    console.log(`+ lookbook "${lb.titolo}"`)
  }

  console.log(`\nDemo: ${created} prodotti creati, ${skipped} già presenti, ${lbCreated} lookbook.`)
  process.exit(0)
}

try {
  await main()
} catch (err) {
  console.error('DEMO ERRORE:', err)
  process.exit(1)
}
