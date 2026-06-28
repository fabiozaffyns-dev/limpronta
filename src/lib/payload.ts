import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Promise<Payload> | null = null

/** Istanza Payload condivisa (Local API) per i Server Component e gli script. */
export function getPayloadClient(): Promise<Payload> {
  if (!cached) cached = getPayload({ config })
  return cached
}
