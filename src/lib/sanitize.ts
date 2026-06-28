/**
 * Serializza un oggetto per l'iniezione in <script type="application/ld+json">.
 * JSON.stringify NON effettua l'escape di <, >, & e dei separatori di riga U+2028/U+2029:
 * senza questo escape un valore dal CMS (es. nome prodotto con "</script>") permette XSS stored.
 */
export function jsonLdSafe(obj: unknown): string {
  const LS = String.fromCharCode(0x2028)
  const PS = String.fromCharCode(0x2029)
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LS)
    .join('\\u2028')
    .split(PS)
    .join('\\u2029')
}

/**
 * Restituisce un href sicuro: ammette solo http(s), mailto, tel e percorsi
 * relativi. Blocca javascript:, data:, ecc. (URL provenienti dal CMS).
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  const v = url.trim()
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v
  if (v.startsWith('/') || v.startsWith('#')) return v
  return undefined
}
