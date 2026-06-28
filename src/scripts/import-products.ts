import config from '@payload-config'
import { existsSync, readdirSync } from 'fs'
import path from 'path'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import * as XLSX from 'xlsx'

type ProductData = RequiredDataFromCollectionSlug<'products'>

import { paragraphs } from '../lib/lexical'
import { slugify } from '../lib/slugify'

/**
 * Import massivo prodotti dalla Local API di Payload (no route serverless → no timeout).
 *   pnpm import:prodotti ./data/prodotti.xlsx ./photos [--dry-run]
 *
 * - Upsert per SKU; crea marchi/categorie mancanti.
 * - Carica le foto {SKU}-01.jpg, {SKU}-02.jpg, … su Cloudinary e le collega.
 * - Idempotente: rieseguibile senza duplicare prodotti né immagini.
 */

type Row = Record<string, unknown>

const TRUE = new Set(['sì', 'si', 's', 'true', 'yes', 'y', 'x', '1'])
function toBool(v: unknown, def = false): boolean {
  if (v == null || v === '') return def
  return TRUE.has(String(v).trim().toLowerCase())
}
function str(v: unknown): string {
  return v == null ? '' : String(v).trim()
}
function splitList(v: unknown): string[] {
  return str(v)
    .split(/[|,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}
function parseStagione(v: unknown): { tipo?: 'PE' | 'AI'; anno?: number } | undefined {
  const m = str(v)
    .toUpperCase()
    .match(/^(PE|AI)\s?(\d{2,4})$/)
  if (!m) return undefined
  const tipo = m[1] as 'PE' | 'AI'
  let anno = parseInt(m[2]!, 10)
  if (anno < 100) anno += 2000
  return { tipo, anno }
}

async function main() {
  const argv = process.argv.slice(2)
  const dryRun = argv.includes('--dry-run')
  const positional = argv.filter((a) => !a.startsWith('--'))
  const xlsxPath = path.resolve(positional[0] ?? './prodotti.xlsx')
  const photosDir = path.resolve(positional[1] ?? './photos')

  if (!existsSync(xlsxPath)) {
    console.error(`File Excel non trovato: ${xlsxPath}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })
  const log = (s: string) => payload.logger.info(s)

  log(`Import da: ${xlsxPath}`)
  log(`Cartella foto: ${existsSync(photosDir) ? photosDir : `(assente: ${photosDir}) — niente foto`}`)
  if (dryRun) log('MODALITÀ DRY-RUN: nessuna scrittura.')

  const wb = XLSX.readFile(xlsxPath)
  const sheet = wb.Sheets['Prodotti'] ?? wb.Sheets[wb.SheetNames[0]!]!
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })

  const photoFiles = existsSync(photosDir) ? readdirSync(photosDir) : []

  const report = {
    creati: 0,
    aggiornati: 0,
    saltati: 0,
    marchiCreati: 0,
    categorieCreate: 0,
    immaginiCaricate: 0,
    errori: [] as string[],
  }

  const brandCache = new Map<string, number | string>()
  const catCache = new Map<string, number | string>()

  async function ensureBrand(nome: string): Promise<number | string> {
    const slug = slugify(nome)
    if (brandCache.has(slug)) return brandCache.get(slug)!
    const found = await payload.find({ collection: 'brands', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    let id: number | string
    if (found.docs[0]) {
      id = found.docs[0].id
    } else if (dryRun) {
      id = `dry-${slug}`
      report.marchiCreati++
    } else {
      const created = await payload.create({ collection: 'brands', locale: 'it', data: { nome, slug } })
      id = created.id
      report.marchiCreati++
    }
    brandCache.set(slug, id)
    return id
  }

  async function ensureCategory(nome: string): Promise<number | string> {
    const slug = slugify(nome)
    if (catCache.has(slug)) return catCache.get(slug)!
    const found = await payload.find({ collection: 'categories', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    let id: number | string
    if (found.docs[0]) {
      id = found.docs[0].id
    } else if (dryRun) {
      id = `dry-${slug}`
      report.categorieCreate++
    } else {
      const created = await payload.create({ collection: 'categories', locale: 'it', data: { nome, slug, sizeType: 'alpha' } })
      id = created.id
      report.categorieCreate++
    }
    catCache.set(slug, id)
    return id
  }

  function findPhotos(sku: string): string[] {
    const re = new RegExp(`^${sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-(\\d+)\\.(jpe?g|png|webp)$`, 'i')
    return photoFiles
      .map((f) => ({ f, m: f.match(re) }))
      .filter((x) => x.m)
      .sort((a, b) => parseInt(a.m![1]!, 10) - parseInt(b.m![1]!, 10))
      .map((x) => x.f)
  }

  async function ensureMedia(filePath: string, alt: string): Promise<number | string> {
    const filename = path.basename(filePath)
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0 })
    if (existing.docs[0]) return existing.docs[0].id
    if (dryRun) {
      report.immaginiCaricate++
      return `dry-${filename}`
    }
    const created = await payload.create({ collection: 'media', data: { alt }, filePath })
    report.immaginiCaricate++
    return created.id
  }

  let rowNum = 1
  for (const row of rows) {
    rowNum++
    const sku = str(row.sku)
    const nome = str(row.nome)
    const brandNome = str(row.brand)
    const categoriaNome = str(row.categoria)

    if (!sku || !nome || !brandNome || !categoriaNome) {
      report.saltati++
      report.errori.push(`Riga ${rowNum}: campi obbligatori mancanti (sku/nome/brand/categoria) — saltata.`)
      continue
    }

    try {
      const brandId = await ensureBrand(brandNome)
      const categoriaId = await ensureCategory(categoriaNome)

      const taglie = splitList(row.taglie).map((t) => ({ taglia: t, disponibile: true }))
      const colori = splitList(row.colori).map((c) => ({ nome: c }))
      const stagione = parseStagione(row.stagione)
      const prezzoRaw = str(row.prezzo)
      const prezzo = prezzoRaw ? Number(prezzoRaw.replace(',', '.')) : undefined
      const descrizioneTxt = str(row.descrizione)

      // Foto
      const files = findPhotos(sku)
      const immagini: (number | string)[] = []
      for (let i = 0; i < files.length; i++) {
        const id = await ensureMedia(path.join(photosDir, files[i]!), `${nome} — immagine ${i + 1}`)
        immagini.push(id)
      }

      const data: Record<string, unknown> = {
        nome,
        sku,
        brand: brandId,
        categoria: categoriaId,
        prezzoSuRichiesta: toBool(row.prezzo_su_richiesta),
        inEvidenza: toBool(row.in_evidenza),
        disponibile: toBool(row.disponibile, true),
        taglie,
        colori,
        _status: 'published',
      }
      if (prezzo != null && !Number.isNaN(prezzo)) data.prezzo = prezzo
      if (stagione) data.stagione = stagione
      if (descrizioneTxt) data.descrizione = paragraphs(descrizioneTxt)
      if (immagini.length) data.immagini = immagini

      const existing = await payload.find({ collection: 'products', where: { sku: { equals: sku } }, limit: 1, depth: 0 })

      if (dryRun) {
        if (existing.docs[0]) report.aggiornati++
        else report.creati++
        continue
      }

      if (existing.docs[0]) {
        await payload.update({
          collection: 'products',
          id: existing.docs[0].id,
          locale: 'it',
          data: data as Partial<ProductData>,
        })
        report.aggiornati++
      } else {
        await payload.create({ collection: 'products', locale: 'it', data: data as ProductData })
        report.creati++
      }
    } catch (err) {
      report.saltati++
      report.errori.push(`Riga ${rowNum} (SKU ${sku}): ${(err as Error).message}`)
    }
  }

  log('────────────────────── REPORT IMPORT ──────────────────────')
  log(`Prodotti creati:      ${report.creati}`)
  log(`Prodotti aggiornati:  ${report.aggiornati}`)
  log(`Prodotti saltati:     ${report.saltati}`)
  log(`Marchi creati:        ${report.marchiCreati}`)
  log(`Categorie create:     ${report.categorieCreate}`)
  log(`Immagini caricate:    ${report.immaginiCaricate}`)
  if (report.errori.length) {
    log(`Errori (${report.errori.length}):`)
    for (const e of report.errori) log(`  • ${e}`)
  }
  log('────────────────────────────────────────────────────────────')
}

// Top-level await: indispensabile sotto `payload run` (un main() non-awaited
// uscirebbe prima del completamento delle operazioni asincrone).
try {
  await main()
  process.exit(0)
} catch (err) {
  console.error('IMPORT ERRORE:', err)
  process.exit(1)
}
