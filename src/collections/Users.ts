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
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
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
