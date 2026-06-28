import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Servizio', plural: 'Servizi' },
  admin: {
    useAsTitle: 'titolo',
    defaultColumns: ['titolo', 'icona', 'ordine'],
    group: 'Contenuti',
  },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'titolo', type: 'text', required: true, localized: true, label: 'Titolo' },
    {
      name: 'descrizione',
      type: 'richText',
      localized: true,
      label: 'Descrizione',
    },
    {
      name: 'icona',
      type: 'select',
      label: 'Icona',
      defaultValue: 'forbici',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Forbici (su misura)', value: 'forbici' },
        { label: 'Metro (sartoria)', value: 'metro' },
        { label: 'Occhio (consulenza d’immagine)', value: 'occhio' },
        { label: 'Borsa (personal shopping)', value: 'borsa' },
        { label: 'Gancio (capispalla)', value: 'gancio' },
        { label: 'Sigillo (impronta)', value: 'sigillo' },
      ],
    },
    {
      name: 'immagine',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine (opzionale)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'ordine',
      type: 'number',
      defaultValue: 0,
      label: 'Ordine',
      admin: { position: 'sidebar' },
    },
  ],
}
