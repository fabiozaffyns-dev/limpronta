import { cn } from '@/lib/cn'

/**
 * Sigillo / monogramma "Ɫ" — un piccolo segno in Ottone che richiama
 * il bottone sartoriale e l'impronta. Decorativo (aria-hidden).
 */
export function Sigillo({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex items-center justify-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        border: '1px solid color-mix(in srgb, var(--color-ottone) 70%, transparent)',
      }}
    >
      <span
        className="font-display"
        style={{
          fontSize: size * 0.46,
          lineHeight: 1,
          color: 'var(--color-ottone)',
          letterSpacing: '0.02em',
          marginTop: size * 0.02,
        }}
      >
        LI
      </span>
    </span>
  )
}
