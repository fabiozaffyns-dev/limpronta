'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'

type Riga = { giorni?: string | null; orario?: string | null; chiuso?: boolean | null }

// getDay(): 0=Dom … 6=Sab → abbreviazione italiana usata nel CMS.
const ABBR = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
const ORDINE = ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom']

function giorniDiRiga(giorni?: string | null): string[] {
  if (!giorni) return []
  const parti = giorni.toLowerCase().split(/[–—-]/).map((s) => s.trim().slice(0, 3))
  if (parti.length === 2) {
    const a = ORDINE.indexOf(parti[0]!)
    const b = ORDINE.indexOf(parti[1]!)
    if (a !== -1 && b !== -1 && a <= b) return ORDINE.slice(a, b + 1)
  }
  return parti.filter((p) => ORDINE.includes(p))
}

/** "9:30 – 12:30 / 16:00 – 19:30" → minuti-da-mezzanotte [[apre,chiude],…]. */
function fasce(orario?: string | null): Array<[number, number]> {
  if (!orario) return []
  const min = (s: string) => {
    const m = s.trim().match(/^(\d{1,2}):(\d{2})$/)
    return m ? Number(m[1]) * 60 + Number(m[2]) : null
  }
  return orario
    .split('/')
    .map((f) => f.split(/[–—-]/).map((s) => s.trim()))
    .filter((p) => p.length === 2)
    .map(([a, b]) => [min(a!), min(b!)] as [number | null, number | null])
    .filter((p): p is [number, number] => p[0] != null && p[1] != null)
}

function hhmm(minuti: number): string {
  const h = Math.floor(minuti / 60)
  const m = minuti % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

type Stato = { aperto: boolean; testo: string }

function calcola(orari: Riga[]): Stato | null {
  if (!orari.length) return null
  const now = new Date()
  const oggi = ABBR[now.getDay()]!
  const minOra = now.getHours() * 60 + now.getMinutes()
  const rigaOggi = orari.find((r) => !r.chiuso && giorniDiRiga(r.giorni).includes(oggi))
  if (rigaOggi) {
    const f = fasce(rigaOggi.orario)
    const corrente = f.find(([a, b]) => minOra >= a && minOra < b)
    if (corrente) return { aperto: true, testo: `Aperto ora · chiude alle ${hhmm(corrente[1])}` }
    const prossima = f.find(([a]) => a > minOra)
    if (prossima) return { aperto: false, testo: `Chiuso · riapre alle ${hhmm(prossima[0])}` }
  }
  return { aperto: false, testo: 'Chiuso ora' }
}

/**
 * Badge "Aperto ora / Chiuso" calcolato dagli orari e dall'ora corrente.
 * Client-only: sul server non conosciamo l'ora del visitatore, quindi non
 * rende nulla finché non monta (niente mismatch di idratazione).
 */
export function StatoNegozio({ orari, scuro = false }: { orari: Riga[]; scuro?: boolean }) {
  const [stato, setStato] = useState<Stato | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- calcolo client dell'ora corrente: sul server non è disponibile (niente mismatch), poi refresh ogni minuto
    setStato(calcola(orari))
    const id = setInterval(() => setStato(calcola(orari)), 60_000)
    return () => clearInterval(id)
  }, [orari])

  if (!stato) return null

  return (
    <span
      className={cn(
        'cartellino inline-flex items-center gap-2',
        stato.aperto ? (scuro ? 'text-ottone-chiaro' : 'text-loden') : scuro ? 'text-avorio/60' : 'text-pietra-scura',
      )}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: stato.aperto ? 'var(--color-loden)' : 'var(--color-pietra)' }}
      />
      {stato.testo}
    </span>
  )
}
