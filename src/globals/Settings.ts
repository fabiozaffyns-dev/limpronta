import type { GlobalConfig } from 'payload'

import { anyone, isAdmin } from '@/access'
import { revalidateGlobalAfterChange } from '@/hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Impostazioni',
  admin: { group: 'Sistema' },
  access: {
    read: anyone,
    update: isAdmin,
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
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
            {
              name: 'contattiFoto',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto pagina Contatti — orizzontale',
              admin: {
                description:
                  'Foto per la pagina Contatti (taglio orizzontale, accanto al cartellino del negozio). Vuoto = usa la Foto 2 di Chi siamo.',
              },
            },
          ],
        },
        {
          label: 'Home',
          fields: [
            {
              name: 'heroMedia',
              type: 'upload',
              relationTo: 'media',
              label: 'Sfondo hero (foto o video)',
              admin: {
                description:
                  'Opzionale. Foto o breve video di sfondo per la home: appare dietro al wordmark con un velo scuro (il wordmark diventa chiaro). Vuoto = hero tipografico chiaro.',
              },
            },
          ],
        },
        {
          label: 'Chi siamo',
          fields: [
            {
              name: 'chiSiamoFoto1',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto 1 — verticale (storia)',
              admin: {
                description:
                  'Foto verticale per la sezione "La nostra storia". Vuoto = pannello materico.',
              },
            },
            {
              name: 'chiSiamoFoto2',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto 2 — verticale (dentro il negozio)',
              admin: {
                description:
                  'Foto VERTICALE dell’interno del negozio per la sezione "Vieni a trovarci" di Chi siamo. Vuoto = pannello materico.',
              },
            },
            {
              name: 'titolareFoto',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto del titolare — quadrata',
              admin: {
                description:
                  'Ritratto QUADRATO (mezzo busto, sfondo neutro, min 600×600px) accanto alla firma in "La nostra storia". Vuoto = mostra solo il nome.',
              },
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
