/** Formattazione prezzi e metadati prodotto, locale italiano. */

type Stagione = { tipo?: string | null; anno?: number | null } | null | undefined

const eur = (frazioni: boolean) =>
  new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: frazioni ? 2 : 0,
    maximumFractionDigits: frazioni ? 2 : 0,
  })

/**
 * Prezzo formattato, oppure `null` se "su richiesta" o non impostato: in tal
 * caso la riga prezzo va semplicemente NON mostrata (niente testo "su richiesta").
 */
export function formatPrice(prezzo?: number | null, suRichiesta?: boolean | null): string | null {
  if (suRichiesta || prezzo == null) return null
  const haDecimali = prezzo % 1 !== 0
  return eur(haDecimali).format(prezzo)
}

/** "PE 25", "AI 24" — etichetta compatta da cartellino. */
export function formatStagione(stagione: Stagione): string | null {
  if (!stagione?.tipo || !stagione?.anno) return null
  const yy = String(stagione.anno).slice(-2)
  return `${stagione.tipo} ${yy}`
}

/** "Primavera/Estate 2025" — forma estesa. */
export function formatStagioneEstesa(stagione: Stagione): string | null {
  if (!stagione?.tipo || !stagione?.anno) return null
  const nome = stagione.tipo === 'PE' ? 'Primavera/Estate' : 'Autunno/Inverno'
  return `${nome} ${stagione.anno}`
}
