/**
 * Loghi ufficiali dei brand per l'indice della pagina /marchi.
 *
 * File statici in /public/loghi, recuperati dai siti ufficiali dei marchi e
 * normalizzati in un'unica pipeline: rasterizzati (gli SVG), ritagliati al
 * bounding box reale (via il canale alpha, così niente padding che rimpicciolisce
 * il segno), tinti in un solo colore e salvati come PNG a palette. Sono mostrati
 * SEMPRE monocromi via CSS mask (mask-image + background currentColor): il colore
 * segue la palette del sito, qualunque colore avesse il file originale, e nessun
 * markup di terze parti entra nel DOM (i file servono solo da maschera alpha).
 *
 * Il logo Minoronzoni 1953 (il loro sito lo rende come solo testo) è stato
 * fornito dal titolare. Chiave = slug del brand a CMS: un brand senza voce qui
 * semplicemente non mostra il logo.
 */
/**
 * Loghi "emblema": quasi quadrati o verticali (non wordmark orizzontali).
 * Nell'indice ricevono un box più alto e centrato (.indice-logo-emblema),
 * altrimenti risulterebbero minuscoli e incollati al filo destro.
 */
export const LOGHI_EMBLEMA = new Set(['canadiens', 'suns'])

export const LOGHI_BRAND: Record<string, string> = {
  '40weft': '/loghi/40weft.png',
  'alessandro-gilles': '/loghi/alessandro-gilles.png',
  'at-p-co': '/loghi/at-p-co.png',
  canadiens: '/loghi/canadiens.png',
  'ciesse-piumini': '/loghi/ciesse-piumini.png',
  corneliani: '/loghi/corneliani.png',
  'diadora-heritage': '/loghi/diadora-heritage.png',
  gallo: '/loghi/gallo.png',
  'harmont-and-blaine': '/loghi/harmont-and-blaine.png',
  homeward: '/loghi/homeward.png',
  'mastai-ferretti': '/loghi/mastai-ferretti.png',
  'minoronzoni-1953': '/loghi/minoronzoni-1953.png',
  'reebok-classic': '/loghi/reebok-classic.png',
  replay: '/loghi/replay.png',
  squad2: '/loghi/squad2.png',
  sun68: '/loghi/sun68.png',
  suns: '/loghi/suns.png',
  valsport: '/loghi/valsport.png',
}
