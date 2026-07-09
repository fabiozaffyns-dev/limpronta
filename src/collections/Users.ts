import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminFieldLevel } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utente', plural: 'Utenti' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Sistema',
  },
  auth: true,
  access: {
    // Gli admin vedono tutti gli utenti; un redattore vede solo il proprio
    // record (niente elenco email di tutti). Non loggati: nessun accesso.
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      return { id: { equals: req.user.id } }
    },
    create: isAdmin,
    update: ({ req, id }) => req.user?.role === 'admin' || String(req.user?.id) === String(id),
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nome' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: 'Ruolo',
      // ESSENZIALE: include il ruolo nel JWT così req.user.role è disponibile
      // nei controlli di accesso (isAdmin / isAdminOrEditor). Senza, ogni
      // scrittura via admin verrebbe bloccata con "Non sei autorizzato".
      saveToJWT: true,
      options: [
        { label: 'Amministratore', value: 'admin' },
        { label: 'Redattore', value: 'editor' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Gli amministratori gestiscono utenti e impostazioni.',
      },
      access: { update: isAdminFieldLevel },
    },
  ],
}
