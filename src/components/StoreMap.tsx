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

  // Se l'utente ha già accettato i cookie, mostra subito la mappa.
  useEffect(() => {
    try {
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
        zoom: 16,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map)

      const icon = L.divIcon({
        className: 'store-pin-wrap',
        html: '<span class="store-pin"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })
      L.marker([lat, lng], { icon, keyboard: false, title: label }).addTo(map)

      // Ricalcola la dimensione dopo il mount (evita la mappa "vuota").
      setTimeout(() => {
        if (!cancelled && map) map.invalidateSize()
      }, 80)
    })()

    return () => {
      cancelled = true
      if (map) map.remove()
    }
  }, [active, lat, lng, label])

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

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cartellino absolute bottom-4 left-4 z-[500] bg-lino/90 px-3 py-2 text-inchiostro backdrop-blur-sm transition-colors hover:bg-lino"
      >
        Apri in mappe →
      </a>
    </div>
  )
}
