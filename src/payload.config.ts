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
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Cloudinary attivo solo se le credenziali sono presenti: in dev senza chiavi
// si usa lo storage su disco (portabilità VPS/S3 = solo cambio plugin + env).
const cloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: "· L'Impronta",
    },
  },
  collections: [Products, Brands, Categories, Lookbooks, Services, Pages, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
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
      tabbedUI: true,
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
              media: { folder: 'limpronta' },
            },
          }),
        ]
      : []),
  ],
})
