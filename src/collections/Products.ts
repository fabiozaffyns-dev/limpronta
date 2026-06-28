import type { CollectionConfig } from 'payload'

import { isAdminOrEditor, publishedOrLoggedIn } from '@/access'
import { slugField } from '@/fields/slug'
import { ensureUniqueSku } from '@/hooks/ensureUniqueSku'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Prodotto', plural: 'Prodotti' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'sku', 'brand', 'categoria', 'prezzo', 'disponibile'],
    group: 'Catalogo',
    listSearchableFields: ['nome', 'sku'],
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 20,
  },
  indexes: [{ fields: ['brand', 'categoria'] }],
  access: {
    read: publishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'nome', type: 'text', required: true, localized: true, label: 'Nome prodotto' },
    slugField({ source: 'nome' }),
    {
      name: 'sku',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'SKU',
      validate: ensureUniqueSku,
      admin: {
        position: 'sidebar',
        description: 'Codice univoco. Chiave per import e nomi file foto ({SKU}-01.jpg).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'brand',
          type: 'relationship',
          relationTo: 'brands',
          required: true,
          label: 'Marchio',
        },
        {
          name: 'categoria',
          type: 'relationship',
          relationTo: 'categories',
          required: true,
          label: 'Categoria',
        },
      ],
    },
    {
      name: 'descrizione',
      type: 'richText',
      localized: true,
      label: 'Descrizione',
    },
    {
      name: 'immagini',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Immagini',
      admin: { description: 'La prima immagine è quella principale (copertina).' },
    },
    {
      type: 'collapsible',
      label: 'Prezzo',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'prezzo',
              type: 'number',
              min: 0,
              label: 'Prezzo (€)',
              admin: {
                step: 1,
                width: '50%',
                condition: (_, sibling) => !sibling?.prezzoSuRichiesta,
              },
            },
            {
              name: 'prezzoSuRichiesta',
              type: 'checkbox',
              defaultValue: false,
              label: 'Prezzo su richiesta',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'taglie',
      type: 'array',
      label: 'Taglie',
      labels: { singular: 'Taglia', plural: 'Taglie' },
      admin: {
        description: 'Le taglie attese dipendono dal sistema taglie della categoria.',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'taglia',
              type: 'text',
              required: true,
              label: 'Taglia',
              admin: { width: '60%' },
            },
            {
              name: 'disponibile',
              type: 'checkbox',
              defaultValue: true,
              label: 'Disponibile',
              admin: { width: '40%' },
            },
          ],
        },
      ],
    },
    {
      name: 'colori',
      type: 'array',
      label: 'Colori',
      labels: { singular: 'Colore', plural: 'Colori' },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'nome',
              type: 'text',
              required: true,
              label: 'Nome colore',
              admin: { width: '60%' },
            },
            {
              name: 'hex',
              type: 'text',
              label: 'Codice HEX',
              admin: { width: '40%', placeholder: '#1C1A17' },
            },
          ],
        },
      ],
    },
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
            {
              name: 'anno',
              type: 'number',
              label: 'Anno',
              min: 2014,
              max: 2100,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'inEvidenza',
      type: 'checkbox',
      defaultValue: false,
      label: 'In evidenza in home',
      admin: { position: 'sidebar' },
    },
    {
      name: 'disponibile',
      type: 'checkbox',
      defaultValue: true,
      label: 'Disponibile in negozio',
      admin: {
        position: 'sidebar',
        description: 'Se disattivato, il prodotto resta visibile ma segnalato come non disponibile.',
      },
    },
  ],
}
