import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'

/**
 * Genera templates/prodotti-template.xlsx con intestazioni, righe d'esempio e
 * un foglio "Istruzioni". Non richiede database.
 *   pnpm template:prodotti
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(dirname, '../templates')
mkdirSync(outDir, { recursive: true })

const COLUMNS = [
  'sku',
  'nome',
  'brand',
  'categoria',
  'descrizione',
  'prezzo',
  'prezzo_su_richiesta',
  'taglie',
  'colori',
  'stagione',
  'in_evidenza',
  'disponibile',
] as const

const EXAMPLES: Record<(typeof COLUMNS)[number], string | number>[] = [
  {
    sku: 'COR-GIA-001',
    nome: 'Giacca destrutturata in lino',
    brand: 'Corneliani',
    categoria: 'Giacche',
    descrizione: 'Giacca monopetto destrutturata, lino puro, due bottoni. Vestibilità morbida.',
    prezzo: 690,
    prezzo_su_richiesta: '',
    taglie: '48,50,52,54',
    colori: 'Blu|Sabbia',
    stagione: 'PE25',
    in_evidenza: 'sì',
    disponibile: 'sì',
  },
  {
    sku: 'HB-POLO-014',
    nome: 'Polo in cotone piqué',
    brand: 'Harmont&Blaine',
    categoria: 'Polo/T-shirt',
    descrizione: 'Polo iconica in piqué di cotone, logo ricamato.',
    prezzo: 120,
    prezzo_su_richiesta: '',
    taglie: 'S,M,L,XL,XXL',
    colori: 'Bianco|Navy|Verde',
    stagione: 'PE25',
    in_evidenza: '',
    disponibile: 'sì',
  },
  {
    sku: 'MF-CAM-007',
    nome: 'Camicia sartoriale lavata',
    brand: 'Mastai Ferretti',
    categoria: 'Camicie',
    descrizione: 'Camicia in cotone lavato, collo francese.',
    prezzo: '',
    prezzo_su_richiesta: 'sì',
    taglie: 'S,M,L,XL',
    colori: 'Celeste',
    stagione: 'AI25',
    in_evidenza: '',
    disponibile: 'sì',
  },
]

const ISTRUZIONI: string[][] = [
  ['Colonna', 'Obbligatoria', 'Descrizione / formato'],
  ['sku', 'Sì', 'Codice univoco. È la chiave dell’import e il prefisso dei nomi foto.'],
  ['nome', 'Sì', 'Nome del prodotto.'],
  ['brand', 'Sì', 'Nome marchio. Se non esiste viene creato.'],
  ['categoria', 'Sì', 'Nome categoria. Se non esiste viene creata.'],
  ['descrizione', 'No', 'Testo libero (diventa un paragrafo).'],
  ['prezzo', 'No', 'Numero in euro, es. 690. Lascia vuoto se su richiesta.'],
  ['prezzo_su_richiesta', 'No', 'sì/no. Se "sì" mostra "Su richiesta" e ignora il prezzo.'],
  ['taglie', 'No', 'Elenco separato da virgola, es. 48,50,52 oppure S,M,L.'],
  ['colori', 'No', 'Elenco separato da | oppure da virgola, es. Blu|Sabbia.'],
  ['stagione', 'No', 'PE o AI seguito dall’anno (2 o 4 cifre), es. PE25 o AI2025.'],
  ['in_evidenza', 'No', 'sì/no. Se "sì" compare tra i prodotti in evidenza in home.'],
  ['disponibile', 'No', 'sì/no (default sì).'],
  ['', '', ''],
  ['FOTO', '', 'Nomina i file: {SKU}-01.jpg, {SKU}-02.jpg, … nella cartella foto.'],
  ['', '', 'La foto -01 è la principale. Formati: jpg, jpeg, png, webp.'],
  ['', '', 'Esempio: COR-GIA-001-01.jpg, COR-GIA-001-02.jpg'],
]

const wb = XLSX.utils.book_new()

const wsProdotti = XLSX.utils.json_to_sheet(EXAMPLES, { header: COLUMNS as unknown as string[] })
wsProdotti['!cols'] = COLUMNS.map((c) => ({ wch: c === 'descrizione' ? 50 : Math.max(c.length + 2, 12) }))
XLSX.utils.book_append_sheet(wb, wsProdotti, 'Prodotti')

const wsIstr = XLSX.utils.aoa_to_sheet(ISTRUZIONI)
wsIstr['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 70 }]
XLSX.utils.book_append_sheet(wb, wsIstr, 'Istruzioni')

const outPath = path.join(outDir, 'prodotti-template.xlsx')
XLSX.writeFile(wb, outPath)

console.log(`Template scritto in: ${outPath}`)
