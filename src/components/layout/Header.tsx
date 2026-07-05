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
  // Su Vercel la rigenerazione ISR della home usa il percorso interno "/index":
  // usePathname() lo restituisce sia nel prerender sia nello stato idratato del
  // router. Senza questo alias l'HTML della home nasceva con la header SOLIDA.
  const isHome = pathname === '/' || pathname === '/index'
  // null = "non ancora misurato": la PRIMA misura (IO o scroll) è sempre un
  // cambio di stato → re-render garantito. Serve perché React all'idratazione
  // NON corregge gli attributi divergenti: se il server ha reso la classe
  // sbagliata e lo stato non cambia mai, la classe sbagliata resta per sempre.
  const [scrolled, setScrolled] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const solid = scrolled === true || !isHome
  // Header trasparente sopra un hero con sfondo scuro → testo chiaro.
  const onDark = !solid && heroDark

  useEffect(() => {
    // Sopra l'hero scuro della home la header resta TRASPARENTE (testo chiaro) e
    // diventa solida (testo scuro) solo DOPO lo scroll dell'hero. L'hero "Il
    // Conio" è pinnato per ~120%vh, quindi la soglia è ~fine hero (col
    // reduced-motion non c'è pin → hero alto 100svh). Altrove: soglia minima.
    const homeHero = isHome && heroDark

    if (homeHero) {
      // Sentinello in cima al documento (renderizzato da DebossHero, FUORI dal
      // pin): finché è in viewport → trasparente; sparito (~96svh di scroll,
      // quando il Lino ha riempito) → solida. IntersectionObserver riporta
      // SEMPRE lo stato geometrico reale — anche al reload, senza eventi
      // scroll, senza stato JS condiviso: niente race possibili.
      const sentinella = document.querySelector('[data-hero-sentinella]')
      if (sentinella) {
        const io = new IntersectionObserver(
          ([entry]) => setScrolled(!entry.isIntersecting),
          { threshold: 0 },
        )
        io.observe(sentinella)
        return () => io.disconnect()
      }
    }

    // Altre pagine (o sentinello assente): soglia semplice.
    const onScroll = () => {
      const threshold = homeHero ? (window.innerHeight || 800) * 0.8 : 24
      setScrolled((window.scrollY || 0) > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname, isHome, heroDark])

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
    <>
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
            if (!isHome) return
            e.preventDefault()
            setOpen(false)
            const lenis = (window as unknown as { __lenis?: { scrollTo?: (t: number, o?: object) => void } }).__lenis
            const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
            if (lenis?.scrollTo && !reduce) lenis.scrollTo(0, { duration: 1.1 })
            else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
          }}
        >
          {/* A menu aperto il drawer è chiaro (lino): forza il wordmark scuro,
             come già fa il burger (dark={onDark && !open}). */}
          <Wordmark scuro={onDark && !open} className="text-xl md:text-2xl" />
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
          className="z-10 flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <span className="sr-only">{open ? 'Chiudi menù' : 'Apri menù'}</span>
          <Burger open={open} dark={onDark && !open} />
        </button>
      </div>
    </header>

      {/* Drawer mobile — FUORI dall'<header>: l'header ha backdrop-blur sulle
         pagine interne, che crea un containing block e ancorerebbe il fixed alla
         sola barra (64px), lasciando trasparire la pagina sotto. Come sibling,
         `fixed inset-0` copre il viewport. z-40 < 50: la barra con la X resta
         sopra e cliccabile. */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal={open || undefined}
        aria-label="Menù di navigazione"
        className={cn(
          'fixed inset-0 z-40 flex flex-col overflow-y-auto bg-lino transition-[opacity,visibility] duration-400 lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      >
        <nav aria-label="Navigazione mobile" className="shell mt-24 flex flex-col gap-1 pb-16">
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
            className="btn btn-ottone mt-8 w-full justify-center sm:w-auto sm:self-start"
          >
            <SwapLabel>Prenota in negozio</SwapLabel>
          </a>
        </nav>
      </div>
    </>
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
