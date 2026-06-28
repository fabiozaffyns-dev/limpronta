import type { CollectionConfig } from 'payload'

import { anyone, isAdminOrEditor } from '@/access'

/** Miniatura admin servita da Cloudinary (o URL originale in dev/disco). */
const adminThumbnail: CollectionConfig['upload'] = {
  adminThumbnail: ({ doc }) => {
    const url = typeof doc?.url === 'string' ? doc.url : null
    if (url && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/')
    }
    return url
  },
  focalPoint: true,
  // Niente imageSizes: con Cloudinary le trasformazioni sono on-the-fly (un solo upload).
  mimeTypes: ['image/*'],
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Immagine', plural: 'Media' },
  admin: { group: 'Sistema', useAsTitle: 'alt' },
  access: {
    read: anyone,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  upload: adminThumbnail,
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: 'Testo alternativo',
      admin: { description: 'Descrizione dell’immagine per accessibilità e SEO.' },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: 'Didascalia',
    },
  ],
}
