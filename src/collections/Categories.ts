import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'
import { slugField } from '@/fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorie' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'sizeType', 'ordine'],
    group: 'Catalogo',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'nome', type: 'text', required: true, localized: true, label: 'Nome' },
    slugField({ source: 'nome' }),
    {
      name: 'ordine',
      type: 'number',
      defaultValue: 0,
      label: 'Ordine nel menù',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sizeType',
      type: 'select',
      required: true,
      defaultValue: 'alpha',
      label: 'Sistema taglie',
      admin: {
        position: 'sidebar',
        description: 'Determina le taglie suggerite per i prodotti di questa categoria.',
      },
      options: [
        { label: 'Alfa (XS – XXL)', value: 'alpha' },
        { label: 'Numeriche EU (44 – 60)', value: 'numeric_eu' },
        { label: 'Calzature EU (39 – 46)', value: 'shoe_eu' },
        { label: 'Taglia unica', value: 'one_size' },
        { label: 'Personalizzate', value: 'custom' },
      ],
    },
    {
      name: 'customSizes',
      type: 'array',
      label: 'Taglie personalizzate',
      admin: { condition: (_, sibling) => sibling?.sizeType === 'custom' },
      fields: [{ name: 'taglia', type: 'text', required: true }],
    },
    { name: 'descrizione', type: 'textarea', localized: true, label: 'Descrizione' },
    {
      name: 'immagine',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine di categoria',
    },
  ],
}
