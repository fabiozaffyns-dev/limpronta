import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Pagina', plural: 'Pagine' },
  admin: {
    useAsTitle: 'titolo',
    defaultColumns: ['titolo', 'slug', 'updatedAt'],
    group: 'Contenuti',
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: publishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'titolo', type: 'text', required: true, localized: true, label: 'Titolo' },
    slugField({ source: 'titolo' }),
    {
      name: 'sommario',
      type: 'textarea',
      localized: true,
      label: 'Sommario',
      admin: { description: 'Breve introduzione mostrata in cima alla pagina.' },
    },
    {
      name: 'immagine',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine di copertina',
      admin: { position: 'sidebar' },
    },
    {
      name: 'contenuto',
      type: 'richText',
      localized: true,
      required: true,
      label: 'Contenuto',
    },
  ],
}
