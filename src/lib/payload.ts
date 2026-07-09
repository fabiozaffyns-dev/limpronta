import config from '@payload-config'
import { getPayload, type Payload } from 'payload'

let cached: Promise<Payload> | null = null

/** Istanza Payload condivisa (Local API) per i Server Component e gli script. */
export function getPayloadClient(): Promise<Payload> {
  // Se l'init fallisce (es. DB freddo/irraggiungibile al cold start), NON
  // memorizzare la promise rifiutata: azzerala così la richiesta successiva
  // ri-inizializza invece di riusare per sempre lo stato fallito.
  if (!cached) {
    cached = getPayload({ config }).catch((err) => {
      cached = null
      throw err
    })
  }
  return cached
}
