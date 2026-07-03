import { SITE_URL } from '@/lib/site'

/**
 * Route handler ESPLICITO invece della convention metadata robots.ts: in
 * Next 16 la route metadata entra in conflitto col catch-all (frontend)/[slug]
 * e /robots.txt finiva 404 (verificato dal vivo). Il segmento letterale
 * "robots.txt" vince sempre sul segmento dinamico.
 */
export const dynamic = 'force-static'

export function GET(): Response {
  const body = [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
