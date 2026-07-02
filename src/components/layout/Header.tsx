'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { SwapLabel } from '@/components/ui/SwapLabel'
import { Wordmark } from '@/components/ui/Wordmark'
import { cn } from '@/lib/cn'
import { appointmentMessage, buildWhatsAppLink } from '@/lib/whatsapp'

const NAV = [
  { href: '/catalogo', label: 'Catalogo' },
  { href: '/marchi', label: 'Marchi' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/chi-siamo', label: 'Chi siamo' },
  { href: '/contatti', label: 'Contatti' },
]

export function Header({
  whatsappNumber,
  heroDark = false,
}: {
  whatsappNumber?: string | null
  heroDark?: boolean
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const solid = scrolled || pathname !== '/'
  // Header trasparente sopra un hero con sfondo scuro → testo chiaro.
  const onDark = !solid && heroDark

  useEffect(() => {
    // Sopra l'hero scuro della home la header resta TRASPARENTE (testo chiaro) e
    // diventa solida (testo scuro) solo DOPO lo scroll dell'hero. L'hero "Il
    // Conio" è pinnato per ~120%vh, quindi la soglia è ~fine hero (col
    // reduced-motion non c'è pin → hero alto 100svh). Altrove: soglia minima.
    const homeHero = pathname === '/' && heroDark
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (homeHero && !reduce) {
      // Col Conio pinnato lo stato arriva DALLA timeline dell'hero (evento
      // 'impronta:hero-fine' quando la lastra di Lino ha riempito): niente
      // euristiche sugli eventi scroll, che al 1° load emettevano transitori
      // fuorvianti (header solida in cima). In cima: trasparente, punto.
      const readFine = () =>
        setScrolled(Boolean((window as unknown as { __heroFine?: boolean }).__heroFine))
      readFine()
      const onFine = (e: Event) => setScrolled(Boolean((e as CustomEvent).detail))
      window.addEventListener('impronta:hero-fine', onFine)
      // Riallineamento nei primi secondi: copre le race del caricamento (Ctrl+R,
      // scroll-restoration, ordine dei mount) rileggendo lo stato pubblicato.
      const iv = window.setInterval(readFine, 300)
      const stop = window.setTimeout(() => window.clearInterval(iv), 5000)
      return () => {
        window.removeEventListener('impronta:hero-fine', onFine)
        window.clearInterval(iv)
        window.clearTimeout(stop)
      }
    }

    // Altre pagine / reduced-motion (hero non pinnato): soglia semplice.
    const onScroll = () => {
      const threshold = homeHero ? (window.innerHeight || 800) * 0.8 : 24
      setScrolled((window.scrollY || 0) > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname, heroDark])

  // Blocca lo scroll del body quando il menù mobile è aperto.
  useEffect(() => {
    document.documentElement.classList.toggle('lenis-stopped', open)
    return () => document.documentElement.classList.remove('lenis-stopped')
  }, [open])

  // Menù mobile aperto: porta il focus al primo link e chiudi con Esc.
  useEffect(() => {
    if (!open) return
    drawerRef.current?.querySelector('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const waLink = buildWhatsAppLink({ number: whatsappNumber, message: appointmentMessage() })

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        solid ? 'bg-lino/95 backdrop-blur-sm' : 'bg-transparent',
      )}
      style={solid ? { borderBottom: '1px solid color-mix(in srgb, var(--color-ottone) 30%, transparent)' } : undefined}
    >
      <div className="shell flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          aria-label="L'Impronta — home"
          className="z-10"
          onClick={(e) => {
            // Già in home: il wordmark riporta in cima (stato "primo accesso").
            if (pathname !== '/') return
            e.preventDefault()
            setOpen(false)
            const lenis = (window as unknown as { __lenis?: { scrollTo?: (t: number, o?: object) => void } }).__lenis
            const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
            if (lenis?.scrollTo && !reduce) lenis.scrollTo(0, { duration: 1.1 })
            else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
          }}
        >
          <Wordmark scuro={onDark} className="text-xl md:text-2xl" />
        </Link>

        <nav aria-label="Navigazione principale" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'cartellino link-segno py-1 transition-colors',
                  onDark
                    ? active
                      ? 'text-ottone-chiaro'
                      : 'text-avorio hover:text-ottone-chiaro'
                    : active
                      ? 'text-ottone-testo'
                      : 'text-inchiostro hover:text-ottone-testo',
                )}
                style={{ fontSize: '0.72rem' }}
              >
                {item.label}
              </Link>
            )
          })}
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-ottone" style={{ padding: '0.6rem 1.1rem' }}>
            <SwapLabel>Prenota in negozio</SwapLabel>
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? 'Chiudi menù' : 'Apri menù'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="z-10 flex h-10 w-10 items-center justify-center lg:hidden"
        >
          <span className="sr-only">{open ? 'Chiudi menù' : 'Apri menù'}</span>
          <Burger open={open} dark={onDark && !open} />
        </button>
      </div>

      {/* Drawer mobile */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Menù di navigazione"
        className={cn(
          'fixed inset-0 z-0 flex flex-col bg-lino transition-[opacity,visibility] duration-400 lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <nav aria-label="Navigazione mobile" className="shell mt-24 flex flex-col gap-1">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display border-b py-4 text-3xl text-inchiostro"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-pietra) 35%, transparent)',
                transitionDelay: `${i * 40}ms`,
              }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="btn btn-ottone mt-8 self-start"
          >
            <SwapLabel>Prenota in negozio</SwapLabel>
          </a>
        </nav>
      </div>
    </header>
  )
}

function Burger({ open, dark = false }: { open: boolean; dark?: boolean }) {
  const bar = dark ? 'bg-avorio' : 'bg-inchiostro'
  return (
    <span className="relative block h-4 w-6" aria-hidden>
      <span
        className={cn('absolute left-0 block h-px w-full transition-transform duration-300', bar)}
        style={{ top: open ? '50%' : '2px', transform: open ? 'rotate(45deg)' : 'none' }}
      />
      <span
        className={cn('absolute left-0 top-1/2 block h-px w-full transition-opacity duration-300', bar)}
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        className={cn('absolute left-0 block h-px w-full transition-transform duration-300', bar)}
        style={{ bottom: open ? '50%' : '2px', transform: open ? 'rotate(-45deg)' : 'none' }}
      />
    </span>
  )
}
