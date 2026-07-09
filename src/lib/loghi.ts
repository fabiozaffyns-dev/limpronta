/**
 * Loghi ufficiali dei brand per l'indice della pagina /marchi.
 *
 * File statici in /public/loghi, recuperati dai siti ufficiali dei marchi e
 * mostrati SEMPRE monocromi via CSS mask (mask-image + background currentColor):
 * il colore segue la palette del sito, qualunque colore abbia il file originale.
 * I badge "in negativo" (Ciesse, Canadiens: testo chiaro su forma scura) sono
 * stati convertiti in PNG con alpha invertita (forma opaca, glifi forati), così
 * la mask li rende fedeli. Il logo Minoronzoni 1953 (il loro sito lo rende come
 * solo testo) è stato fornito dal titolare e ridotto a sagoma monocroma allo
 * stesso modo. Chiave = slug del brand a CMS: un brand senza voce qui
 * semplicemente non mostra il logo.
 */
export const LOGHI_BRAND: Record<string, string> = {
  '40weft': '/loghi/40weft.png',
  'alessandro-gilles': '/loghi/alessandro-gilles.svg',
  'at-p-co': '/loghi/at-p-co.png',
  canadiens: '/loghi/canadiens.png',
  'ciesse-piumini': '/loghi/ciesse-piumini.png',
  corneliani: '/loghi/corneliani.svg',
  'diadora-heritage': '/loghi/diadora-heritage.svg',
  gallo: '/loghi/gallo.svg',
  'harmont-and-blaine': '/loghi/harmont-and-blaine.svg',
  homeward: '/loghi/homeward.svg',
  'mastai-ferretti': '/loghi/mastai-ferretti.png',
  'minoronzoni-1953': '/loghi/minoronzoni-1953.png',
  'reebok-classic': '/loghi/reebok-classic.svg',
  replay: '/loghi/replay.svg',
  squad2: '/loghi/squad2.svg',
  sun68: '/loghi/sun68.svg',
  suns: '/loghi/suns.png',
  valsport: '/loghi/valsport.svg',
}
