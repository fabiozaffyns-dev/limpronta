import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ImageResponse } from 'next/og'

/**
 * Immagine OpenGraph di default (1200×630): wordmark su Lino, stessa palette e
 * stesse famiglie del sito (Cinzel per il segno, Fraunces per la riga). Le
 * condivisioni WhatsApp/social escono con un'anteprima brandizzata.
 * I font arrivano da @fontsource (build-time, nessuna richiesta esterna).
 * NB: Next pubblica questa route con un hash nel nome → il JSON-LD usa invece
 * la copia statica public/og.png (stesso disegno; rigenerarla da qui se cambia).
 */
export const alt = "L'Impronta — Abbigliamento uomo a Orbassano"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const font = (pkg: string) =>
  readFile(path.join(process.cwd(), 'node_modules', '@fontsource', pkg))

export default async function OpengraphImage() {
  const [cinzel, fraunces] = await Promise.all([
    font('cinzel/files/cinzel-latin-600-normal.woff'),
    font('fraunces/files/fraunces-latin-400-normal.woff'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E6DFD1',
          color: '#1C1A17',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Fraunces',
            fontSize: 26,
            letterSpacing: '0.32em',
            color: '#6B5226',
          }}
        >
          ABBIGLIAMENTO UOMO · ORBASSANO
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 34,
            fontFamily: 'Cinzel',
            fontSize: 132,
            letterSpacing: '0.04em',
            lineHeight: 1,
          }}
        >
          L&apos;IMPRONTA
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 44,
            width: 120,
            height: 2,
            backgroundColor: '#9E7E45',
          }}
        />
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontFamily: 'Fraunces',
            fontSize: 30,
            fontStyle: 'italic',
            color: '#5E574C',
          }}
        >
          Si guarda, si tocca, si prenota in negozio.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Cinzel', data: cinzel, weight: 600, style: 'normal' },
        { name: 'Fraunces', data: fraunces, weight: 400, style: 'normal' },
      ],
    },
  )
}
