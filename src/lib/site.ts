// URL pubblico del sito — UNICA fonte per metadata, sitemap, robots e JSON-LD.
// Stessa catena di fallback di payload.config.ts: su Vercel, se
// NEXT_PUBLIC_SERVER_URL manca, deriva dal dominio di produzione del progetto
// invece di ricadere in silenzio su localhost (sitemap/canonical rotti).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
