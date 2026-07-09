'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Opt = { value: string; label: string }

const STAGIONI: Opt[] = [
  { value: 'PE', label: 'Primavera/Estate' },
  { value: 'AI', label: 'Autunno/Inverno' },
]
const ORDINAMENTI: Opt[] = [
  { value: 'novita', label: 'Novità' },
  { value: 'prezzo-asc', label: 'Prezzo crescente' },
  { value: 'prezzo-desc', label: 'Prezzo decrescente' },
  { value: 'nome', label: 'Nome A–Z' },
]

export function Filters({
  brands,
  categories,
  taglie,
  colori,
}: {
  brands: Opt[]
  categories: Opt[]
  taglie: Opt[]
  colori: Opt[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(sp.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete('page')
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [router, pathname, sp],
  )

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    update('q', String(fd.get('q') ?? '').trim())
  }

  const activeKeys = ['q', 'brand', 'categoria', 'stagione', 'taglia', 'colore', 'sort']
  const hasFilters = activeKeys.some((k) => sp.get(k))

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSearch} className="flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1">
          <span className="cartellino text-pietra-scura">Cerca</span>
          <input
            key={sp.get('q') ?? ''}
            type="search"
            name="q"
            defaultValue={sp.get('q') ?? ''}
            placeholder="Nome o codice…"
            className="min-h-[44px] w-full border bg-lino-chiaro/40 px-3 py-2.5 text-inchiostro outline-none transition-colors focus:border-ottone"
            style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 45%, transparent)' }}
          />
        </label>
        <button type="submit" className="btn btn-ghost min-h-[44px]" style={{ padding: '0.7rem 1.1rem' }}>
          Cerca
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Select label="Marchio" value={sp.get('brand') ?? ''} options={brands} onChange={(v) => update('brand', v)} />
        <Select label="Categoria" value={sp.get('categoria') ?? ''} options={categories} onChange={(v) => update('categoria', v)} />
        <Select label="Stagione" value={sp.get('stagione') ?? ''} options={STAGIONI} onChange={(v) => update('stagione', v)} />
        <Select label="Taglia" value={sp.get('taglia') ?? ''} options={taglie} onChange={(v) => update('taglia', v)} />
        <Select label="Colore" value={sp.get('colore') ?? ''} options={colori} onChange={(v) => update('colore', v)} />
        <Select label="Ordina" value={sp.get('sort') ?? ''} options={ORDINAMENTI} onChange={(v) => update('sort', v)} placeholderLabel="Novità" />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="cartellino link-segno inline-flex min-h-[44px] items-center self-start text-ottone-testo"
        >
          Azzera filtri
        </button>
      )}
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
  placeholderLabel = 'Tutti',
}: {
  label: string
  value: string
  options: Opt[]
  onChange: (v: string) => void
  placeholderLabel?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="cartellino text-pietra-scura">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] w-full border bg-lino-chiaro/40 px-3 py-2.5 text-sm text-inchiostro outline-none transition-colors focus:border-ottone"
        style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 45%, transparent)' }}
      >
        <option value="">{placeholderLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
