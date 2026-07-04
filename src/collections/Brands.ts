import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Marchio', plural: 'Marchi' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'inEvidenzaHome', 'ordine'],
    group: 'Catalogo',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { name: 'nome', type: 'text', required: true, label: 'Nome' },
    slugField({ source: 'nome' }),
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (opzionale)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'descrizione',
      type: 'richText',
      localized: true,
      label: 'Descrizione',
    },
    {
      name: 'sito',
      type: 'text',
      label: 'Sito ufficiale',
      admin: { position: 'sidebar', placeholder: 'https://…' },
    },
    {
      name: 'ordine',
      type: 'number',
      defaultValue: 0,
      label: 'Ordine',
      admin: {
        position: 'sidebar',
        description: 'Numero più basso = mostrato prima. Lascia 0 per l’ordine alfabetico.',
      },
    },
    {
      name: 'inEvidenzaHome',
      type: 'checkbox',
      defaultValue: false,
      label: 'In evidenza in home',
      admin: {
        position: 'sidebar',
        description:
          'Mostra il marchio nel “muro dei marchi” della homepage. Se nessun marchio è spuntato, la home li mostra tutti.',
      },
    },
  ],
}
