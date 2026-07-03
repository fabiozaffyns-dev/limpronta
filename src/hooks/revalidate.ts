import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Rigenera (ISR on-demand) tutte le pagine pubbliche quando un contenuto cambia
 * in admin, così le modifiche compaiono SUBITO invece di attendere i ~2 minuti
 * di revalidate. `revalidatePath('/', 'layout')` invalida l'intero sito.
 *
 * IMPORTANTE: la revalidazione è DIFFERITA con `after()` — gira DOPO che la
 * risposta è stata inviata. Se la si chiama in modo sincrono dentro l'hook,
 * invalida la Router Cache DURANTE l'operazione dell'admin e la lista resta
 * "stantia" dopo un delete finché non si ricarica (Payload issue #7073). Fuori
 * da una richiesta Next (seed/import via Local API) `after` non è disponibile:
 * si ricade su una revalidazione diretta, ignorata se anch'essa non applicabile.
 */
function revalidateSite(): void {
  const run = () => {
    try {
      revalidatePath('/', 'layout')
    } catch {
      /* fuori da una richiesta Next (CLI/seed): nessuna pagina da rigenerare */
    }
  }
  try {
    after(run)
  } catch {
    run()
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateSite()
  return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({ doc }) => {
  revalidateSite()
  return doc
}
