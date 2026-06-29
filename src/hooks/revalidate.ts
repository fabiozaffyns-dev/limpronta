import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Rigenera (ISR on-demand) tutte le pagine pubbliche quando un contenuto cambia
 * in admin, così le modifiche compaiono SUBITO invece di attendere i ~2 minuti
 * di revalidate. `revalidatePath('/', 'layout')` invalida l'intero sito (layout
 * radice): per un sito vetrina a basso traffico il costo è trascurabile.
 *
 * Il try/catch serve quando l'operazione gira FUORI da un contesto Next (es.
 * script di seed/import via Local API): lì revalidatePath non è disponibile e va
 * semplicemente ignorato.
 */
function revalidateSite(): void {
  try {
    revalidatePath('/', 'layout')
  } catch {
    /* fuori da una richiesta Next (CLI/seed): nessuna pagina da rigenerare */
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
