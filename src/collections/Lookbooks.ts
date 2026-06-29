import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Lookbooks: CollectionConfig = {
  slug: 'lookbooks',
  labels: { singular: 'Lookbook', plural: 'Lookbook' },
  admin: {
    useAsTitle: 'titolo',
    defaultColumns: ['titolo', 'updatedAt'],
    group: 'Editoriale',
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: {
    read: publishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'titolo', type: 'text', required: true, localized: true, label: 'Titolo' },
    slugField({ source: 'titolo' }),
    {
      name: 'stagione',
      type: 'group',
      label: 'Stagione',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'tipo',
              type: 'select',
              label: 'Tipo',
              options: [
                { label: 'Primavera/Estate (PE)', value: 'PE' },
                { label: 'Autunno/Inverno (AI)', value: 'AI' },
              ],
              admin: { width: '50%' },
            },
            { name: 'anno', type: 'number', label: 'Anno', admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'descrizione',
      type: 'richText',
      localized: true,
      label: 'Introduzione',
    },
    {
      name: 'immagini',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Immagini',
    },
    {
      name: 'brandsCorrelati',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: true,
      label: 'Marchi presenti',
      admin: { position: 'sidebar' },
    },
  ],
}
