import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { it } from '@payloadcms/translations/languages/it'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { cloudinaryStorage } from 'payload-storage-cloudinary'

import { Brands } from './collections/Brands'
import { Categories } from './collections/Categories'
import { Lookbooks } from './collections/Lookbooks'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// URL pubblico del sito. Su Vercel deriva automaticamente dal dominio di
// produzione del progetto; in locale fallback a localhost. È ESSENZIALE: senza,
// Payload (difesa CSRF) respinge ogni salvataggio dall'admin fatto via cookie
// con "Non sei autorizzato", perché l'origine non è nella whitelist.
const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

// URL specifico del deployment corrente (preview/branch) per non bloccare
// l'admin sulle anteprime.
const deploymentURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined

// Domini noti del sito, hardcoded come rete di sicurezza: le variabili di
// sistema Vercel (VERCEL_PROJECT_PRODUCTION_URL) NON sempre sono esposte a
// runtime, quindi non possiamo dipendere solo da quelle per la whitelist CSRF.
// Quando si aggiunge un dominio personalizzato, va inserito qui (o in
// NEXT_PUBLIC_SERVER_URL).
const knownOrigins = ['https://limpronta.vercel.app']

const isProd = process.env.NODE_ENV === 'production'

// Fail-fast in produzione: un secret vuoto comprometterebbe la firma di
// JWT/cookie di sessione; una connection string vuota rompe tutto in silenzio.
// Meglio un errore esplicito al boot che un deploy insicuro/degradato.
if (isProd) {
  if (!process.env.PAYLOAD_SECRET) throw new Error('PAYLOAD_SECRET mancante in produzione.')
  if (!process.env.DATABASE_URI) throw new Error('DATABASE_URI mancante in produzione.')
}

// Origini fidate per CORS e CSRF (cookie). De-duplicate. localhost SOLO fuori
// produzione: in prod non deve stare nella whitelist.
const trustedOrigins = Array.from(
  new Set(
    [serverURL, deploymentURL, ...knownOrigins, isProd ? null : 'http://localhost:3000'].filter(
      Boolean,
    ) as string[],
  ),
)

// Cloudinary attivo solo se le credenziali sono presenti: in dev senza chiavi
// si usa lo storage su disco (portabilità VPS/S3 = solo cambio plugin + env).
const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

// In produzione lo storage su disco NON esiste (FS Vercel effimero/read-only):
// se Cloudinary non è configurato gli upload andrebbero persi in silenzio.
// Meglio fallire subito che degradare in modo insicuro.
if (isProd && !cloudinaryEnabled) {
  throw new Error('Credenziali Cloudinary mancanti in produzione (storage su disco non disponibile).')
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "· L'Impronta",
    },
  },
  collections: [Products, Brands, Categories, Lookbooks, Pages, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL,
  // Whitelist per CORS (richieste cross-origin) e CSRF (auth via cookie
  // dell'admin). Senza queste, i salvataggi dal browser danno "Non sei
  // autorizzato" pur essendo loggati come admin.
  cors: trustedOrigins,
  csrf: trustedOrigins,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    // Push (sync schema automatico) SOLO fuori produzione. In prod lo schema si
    // evolve con migrazioni versionate (payload migrate), MAI con un push
    // automatico che potrebbe alterare/eliminare colonne senza rollback.
    push: !isProd,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  localization: {
    locales: [{ label: 'Italiano', code: 'it' }],
    defaultLocale: 'it',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { it },
    fallbackLanguage: 'it',
  },
  plugins: [
    seoPlugin({
      collections: ['products', 'pages'],
      uploadsCollection: 'media',
      // false: niente tab (che Payload "ricorda", riaprendo il prodotto su SEO);
      // i campi SEO diventano una sezione in fondo → si parte SEMPRE dalla scheda.
      tabbedUI: false,
      generateTitle: ({ doc }) => {
        const t = (doc as { nome?: string; titolo?: string })?.nome ?? (doc as { titolo?: string })?.titolo
        return t ? `${t} · L'Impronta` : "L'Impronta"
      },
      generateDescription: ({ doc }) => (doc as { sommario?: string })?.sommario ?? '',
    }),
    ...(cloudinaryEnabled
      ? [
          cloudinaryStorage({
            cloudConfig: {
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            },
            collections: {
              // resourceType 'auto' → gestisce immagini e video (sfondo hero).
              media: { folder: 'limpronta', resourceType: 'auto' },
            },
          }),
        ]
      : []),
  ],
})
