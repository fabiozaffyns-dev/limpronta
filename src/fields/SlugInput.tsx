'use client'

import type { TextFieldClientProps } from 'payload'

import { Button, FieldDescription, FieldLabel, TextInput, useField, useFormFields } from '@payloadcms/ui'
import React, { useCallback } from 'react'

import { slugify } from '@/lib/slugify'

type Props = TextFieldClientProps & {
  /** Path del campo sorgente (es. "nome" o "titolo") da cui generare lo slug. */
  sourcePath?: string
}

/**
 * Campo slug con bottone "Genera": riempie lo slug dal campo sorgente
 * (nome/titolo) normalizzato con lo stesso slugify usato dai hook server.
 * Non salva nulla da solo: aggiorna solo il valore nel form.
 */
export function SlugInput({ field, path, sourcePath = 'nome' }: Props) {
  const fieldPath = path || field.name
  const { value, setValue } = useField<string>({ path: fieldPath })
  const sorgente = useFormFields(([fields]) => fields?.[sourcePath]?.value as string | undefined)

  const genera = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (typeof sorgente === 'string' && sorgente.trim().length > 0) setValue(slugify(sorgente))
    },
    [sorgente, setValue],
  )

  const etichettaSorgente = sourcePath === 'titolo' ? 'titolo' : 'nome'
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined

  return (
    <div className="field-type slug-field-component">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <FieldLabel htmlFor={`field-${fieldPath}`} label={field.label} required={field.required} />
        <Button
          size="small"
          buttonStyle="pill"
          onClick={genera}
          disabled={!(typeof sorgente === 'string' && sorgente.trim().length > 0)}
          margin={false}
        >
          Genera dal {etichettaSorgente}
        </Button>
      </div>
      <TextInput
        path={fieldPath}
        value={value || ''}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      />
      {description && <FieldDescription description={description} path={fieldPath} />}
    </div>
  )
}
