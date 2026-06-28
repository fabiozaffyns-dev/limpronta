/**
 * Genera uno slug URL-safe da una stringa italiana:
 * minuscole, accenti rimossi, apostrofi eliminati, spazi/simboli → trattini.
 *   "L'Impronta — Polo & T-shirt" → "limpronta-e-polo-t-shirt"
 */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // rimuove i diacritici (accenti)
    .toLowerCase()
    .trim()
    .replace(/[‘’']/g, '') // apostrofi dritti e tipografici
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-') // tutto il resto → trattino
    .replace(/^-+|-+$/g, '') // niente trattini iniziali/finali
}
