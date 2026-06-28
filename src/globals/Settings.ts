import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '@/access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Impostazioni',
  admin: { group: 'Sistema' },
  access: {
    read: anyone,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Negozio',
          fields: [
            {
              name: 'ragioneSociale',
              type: 'text',
              label: 'Ragione sociale',
              defaultValue: "L'Impronta di Zaffino Fabio",
            },
            { name: 'partitaIva', type: 'text', label: 'Partita IVA', defaultValue: '11162620014' },
            {
              name: 'indirizzo',
              type: 'group',
              label: 'Indirizzo negozio',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'via',
                      type: 'text',
                      label: 'Via',
                      defaultValue: 'Via Vittorio Emanuele II',
                      admin: { width: '70%' },
                    },
                    {
                      name: 'civico',
                      type: 'text',
                      label: 'Civico',
                      defaultValue: '12/A',
                      admin: { width: '30%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cap',
                      type: 'text',
                      label: 'CAP',
                      defaultValue: '10043',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'citta',
                      type: 'text',
                      label: 'Città',
                      defaultValue: 'Orbassano',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'provincia',
                      type: 'text',
                      label: 'Provincia',
                      defaultValue: 'TO',
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Contatti',
          fields: [
            { name: 'telefono', type: 'text', label: 'Telefono', defaultValue: '011 6206975' },
            { name: 'email', type: 'text', label: 'Email' },
            {
              name: 'whatsappNumber',
              type: 'text',
              label: 'Numero WhatsApp (E.164, senza +)',
              admin: {
                description:
                  'Es. 393331234567. Se vuoto si usa NEXT_PUBLIC_WHATSAPP_NUMBER. Il fisso non vale per WhatsApp.',
              },
            },
            {
              name: 'formspreeEndpoint',
              type: 'text',
              label: 'Endpoint Formspree (form di backup)',
              admin: { placeholder: 'https://formspree.io/f/xxxxxxx' },
            },
          ],
        },
        {
          label: 'Orari',
          fields: [
            {
              name: 'orari',
              type: 'array',
              label: 'Orari di apertura',
              labels: { singular: 'Riga oraria', plural: 'Righe orarie' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'giorni',
                      type: 'text',
                      label: 'Giorno/i',
                      admin: { width: '40%', placeholder: 'Lun – Sab' },
                    },
                    {
                      name: 'orario',
                      type: 'text',
                      label: 'Orario',
                      admin: { width: '45%', placeholder: '9:30 – 13:00 / 15:30 – 19:30' },
                    },
                    {
                      name: 'chiuso',
                      type: 'checkbox',
                      label: 'Chiuso',
                      admin: { width: '15%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Social & Mappa',
          fields: [
            {
              name: 'social',
              type: 'group',
              label: 'Social',
              fields: [
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'Instagram (URL)',
                  defaultValue: 'https://www.instagram.com/limpronta_abbigliamento',
                },
                {
                  name: 'facebook',
                  type: 'text',
                  label: 'Facebook (URL)',
                  defaultValue: 'https://www.facebook.com/limprontaabbigliamento.uomo',
                },
              ],
            },
            {
              name: 'mappa',
              type: 'group',
              label: 'Mappa',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'lat', type: 'number', label: 'Latitudine', admin: { width: '50%' } },
                    { name: 'lng', type: 'number', label: 'Longitudine', admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'googleMapsUrl',
                  type: 'text',
                  label: 'Link Google Maps',
                  admin: { placeholder: 'https://maps.google.com/…' },
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoDefault',
              type: 'group',
              label: 'SEO predefinita',
              fields: [
                { name: 'titolo', type: 'text', label: 'Titolo predefinito' },
                { name: 'descrizione', type: 'textarea', label: 'Descrizione predefinita' },
                {
                  name: 'immagine',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Immagine OpenGraph predefinita',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
