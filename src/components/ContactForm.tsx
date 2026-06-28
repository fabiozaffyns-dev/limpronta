'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'sending' | 'ok' | 'error'

export function ContactForm({
  endpoint,
  oggetto,
}: {
  endpoint?: string | null
  /** Oggetto precompilato (es. nome prodotto + SKU). */
  oggetto?: string
}) {
  const [status, setStatus] = useState<Status>('idle')

  if (!endpoint) {
    return (
      <p className="text-sm text-pietra-scura">
        Il modulo non è ancora configurato. Scrivici su WhatsApp o chiama il negozio: ti
        rispondiamo volentieri.
      </p>
    )
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    if (data.get('_gotcha')) return // honeypot
    setStatus('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setStatus('ok')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'ok') {
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={(el) => {
          el?.focus()
        }}
        className="border border-loden/40 bg-loden/5 p-6 outline-none"
      >
        <p className="font-display text-xl text-loden">Messaggio inviato.</p>
        <p className="mt-2 text-sm text-pietra-scura">
          Ti ricontatteremo al più presto. Grazie per averci scritto.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {oggetto && <input type="hidden" name="oggetto" value={oggetto} />}
      {/* honeypot anti-spam */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <Field label="Nome e cognome" name="nome" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Telefono" name="telefono" type="tel" />
      </div>

      <label className="flex flex-col gap-2">
        <span className="cartellino text-pietra-scura">Messaggio</span>
        <textarea
          name="messaggio"
          required
          rows={5}
          className="border bg-lino-chiaro/40 px-4 py-3 text-inchiostro outline-none transition-colors focus:border-ottone"
          style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 45%, transparent)' }}
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          aria-busy={status === 'sending'}
          className="btn btn-primario disabled:opacity-60"
        >
          {status === 'sending' ? 'Invio…' : 'Invia richiesta'}
        </button>
        <p role="alert" aria-live="assertive" className="text-sm font-semibold text-errore">
          {status === 'error' ? 'Invio non riuscito. Riprova o scrivici su WhatsApp.' : ''}
        </p>
      </div>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="cartellino text-pietra-scura">
        {label}
        {required && (
          <span className="text-ottone-testo" aria-hidden>
            {' '}
            *
          </span>
        )}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="border bg-lino-chiaro/40 px-4 py-3 text-inchiostro outline-none transition-colors focus:border-ottone"
        style={{ borderColor: 'color-mix(in srgb, var(--color-pietra) 45%, transparent)' }}
      />
    </label>
  )
}
