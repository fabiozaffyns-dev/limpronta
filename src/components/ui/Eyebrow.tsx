import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Eyebrow / etichetta sartoriale (maiuscoletto spaziato in Ottone). */
export function Eyebrow({
  children,
  className,
  as: Tag = 'p',
  scuro = false,
}: {
  children: ReactNode
  className?: string
  as?: 'p' | 'span' | 'div'
  scuro?: boolean
}) {
  return (
    <Tag
      className={cn(
        'cartellino inline-flex items-center gap-2',
        scuro ? 'text-ottone-chiaro' : 'text-ottone-testo',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('inline-block h-px w-6 opacity-70', scuro ? 'bg-ottone-chiaro' : 'bg-ottone')}
      />
      {children}
    </Tag>
  )
}
