'use client'

import 'leaflet/dist/leaflet.css'

import { useEffect, useRef, useState } from 'react'

const CONSENT_KEY = 'limpronta-consent-v1'

/**
 * Mappa del negozio in stile editoriale: tile monocromatiche (CARTO light) con
 * trattamento seppia coordinato alla palette, pin in ottone. Le tile (richiesta
 * di terze parti) si caricano SOLO dopo un'azione esplicita o col consenso cookie
 * già accordato — niente chiamate esterne prima del consenso (GDPR). La libreria
 * Leaflet è caricata in lazy al momento dell'attivazione.
 */
export function StoreMap({
  lat,
  lng,
  label,
  mapsUrl,
}: {
  lat: number
  lng: number
  label: string
  mapsUrl: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  // Se l'utente ha già accettato i cookie, mostra subito la mappa. La lettura
  // DEVE stare in un effect (localStorage non esiste in SSR: leggerlo nello
  // useState iniziale creerebbe un mismatch di idratazione).
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync una tantum col valore persistito, nessuna cascata
      if (localStorage.getItem(CONSENT_KEY) === 'accepted') setActive(true)
    } catch {
      /* localStorage non disponibile: resta il placeholder */
    }
  }, [])

  useEffect(() => {
    if (!active || !containerRef.current) return
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any

    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = (await import('leaflet')) as any
      const L = mod.default ?? mod
      if (cancelled || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 17,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false,
      })

      // Alidade Smooth Dark (Stadia): scura e disegnata per essere leggibile.
      // Auth per DOMINIO (limpronta.vercel.app registrato in Stadia): nessuna
      // API key in URL. In locale "just works" da localhost.
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution:
          '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap contributors',
      }).addTo(map)

      // Pin = il dot in ottone resta sul punto, col wordmark "L'Impronta" SOPRA,
      // bianco (mappa scura) e stretto come in header. Tutto cliccabile → Maps.
      const icon = L.divIcon({
        className: 'store-mark-wrap',
        html: '<span class="wordmark store-mark">L’Impronta</span><span class="store-pin"></span>',
        iconSize: [220, 62],
        iconAnchor: [110, 50],
      })
      const marker = L.marker([lat, lng], {
        icon,
        keyboard: false,
        title: label,
        riseOnHover: true,
      }).addTo(map)
      marker.on('click', () => window.open(mapsUrl, '_blank', 'noopener,noreferrer'))

      // Ricalcola la dimensione dopo il mount (evita la mappa "vuota").
      setTimeout(() => {
        if (!cancelled && map) map.invalidateSize()
      }, 80)
    })()

    return () => {
      cancelled = true
      if (map) map.remove()
    }
  }, [active, lat, lng, label, mapsUrl])

  return (
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-inchiostro-tenue">
      {active ? (
        <div ref={containerRef} className="store-map h-full w-full" />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group flex h-full w-full flex-col items-center justify-center gap-5 px-6 text-center"
        >
          <span aria-hidden className="store-pin store-pin--lg" />
          <span className="font-display text-2xl text-avorio md:text-3xl">{label}</span>
          <span className="cartellino text-ottone-chiaro transition-colors group-hover:text-avorio">
            Mostra la mappa →
          </span>
        </button>
      )}

      {/* Il pill "Apri in mappe" solo quando la mappa è attiva: nello stato
         placeholder si sovrapporrebbe al bottone "Mostra la mappa" (che occupa
         tutta l'area), rendendo ambigua l'azione al tocco. */}
      {active && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cartellino absolute bottom-4 left-4 z-[500] bg-lino/90 px-3 py-2 text-inchiostro backdrop-blur-sm transition-colors hover:bg-lino"
        >
          Apri in mappe →
        </a>
      )}
    </div>
  )
}
