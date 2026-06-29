import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Sincronizza lo schema del DB con le collection/global (push additivo).
 * Eseguire con TUTTE le env (incluse CLOUDINARY_*) così il diff è solo additivo:
 *   node --env-file=.env --import tsx/esm src/scripts/_push.ts
 */
await getPayload({ config })
console.log('Schema sincronizzato (push applicato).')
process.exit(0)
