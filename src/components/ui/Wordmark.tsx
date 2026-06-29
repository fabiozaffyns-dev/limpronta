import type { ElementType } from 'react'

import { cn } from '@/lib/cn'

type WordmarkProps = {
  as?: ElementType
  className?: string
  /** Variante per fondi scuri (Inchiostro). */
  scuro?: boolean
  [attr: `data-${string}`]: unknown
}

/**
 * Wordmark tipografico "L'IMPRONTA" — il logo della v1.
 * Trattato come segno inciso/debossato (classe .incisa) in Fraunces maiuscolo.
 */
export function Wordmark({ as: Tag = 'span', className, scuro = false, ...rest }: WordmarkProps) {
  return (
    <Tag
      {...rest}
      className={cn(
        'wordmark select-none',
        scuro ? 'text-avorio incisa-scuro' : 'text-inchiostro incisa',
        className,
      )}
    >
      L<span style={{ letterSpacing: '0.04em' }}>’</span>Impronta
    </Tag>
  )
}
