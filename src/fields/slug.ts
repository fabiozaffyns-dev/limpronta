import type { Field } from 'payload'

import { slugify } from '@/lib/slugify'

type SlugOptions = {
  /** Campo sorgente da cui derivare lo slug se lasciato vuoto. */
  source?: string
  unique?: boolean
}

/**
 * Campo slug riutilizzabile: indicizzato, unico, in sidebar.
 * Se l'utente non lo compila, viene generato dallo `source` (es. "nome"/"titolo").
 * Se lo compila, viene comunque normalizzato (slugify).
 */
export const slugField = ({ source = 'nome', unique = true }: SlugOptions = {}): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique,
  index: true,
  label: 'Slug (URL)',
  admin: {
    position: 'sidebar',
    description: 'Generato dal nome se lasciato vuoto. Usato negli URL: modifica con cautela.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        if (typeof value === 'string' && value.trim().length > 0) return slugify(value)
        const src = data?.[source]
        if (typeof src === 'string' && src.trim().length > 0) return slugify(src)
        return value
      },
    ],
  },
})
