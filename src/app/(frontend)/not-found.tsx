import Link from 'next/link'

import { Sigillo } from '@/components/ui/Sigillo'
import { Eyebrow } from '@/components/ui/Eyebrow'

export default function NotFound() {
  return (
    <section className="shell flex min-h-[70svh] flex-col items-center justify-center text-center">
      <Sigillo size={64} />
      <Eyebrow className="mt-8">Errore 404</Eyebrow>
      <h1 className="mt-4 text-4xl md:text-5xl">Pagina non trovata</h1>
      <p className="mt-4 max-w-md text-pietra-scura">
        La pagina che cerchi non esiste o è stata spostata. Torna alle nostre selezioni.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn btn-primario">
          Home
        </Link>
        <Link href="/catalogo" className="btn btn-ghost">
          Catalogo
        </Link>
      </div>
    </section>
  )
}
