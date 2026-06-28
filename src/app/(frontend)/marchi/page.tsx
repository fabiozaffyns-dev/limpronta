import type { Metadata } from 'next'
import Link from 'next/link'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { PageIntro } from '@/components/ui/PageIntro'
import { mediaUrl } from '@/lib/media'
import { getBrands } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Marchi',
  description:
    "I marchi selezionati da L'Impronta: sartoria italiana e firme contemporanee per l'uomo, scelte una a una.",
}

export default async function MarchiPage() {
  const brands = await getBrands()

  return (
    <>
      <PageIntro eyebrow="Le firme" titolo="Marchi">
        Ogni marchio è scelto per coerenza, qualità e carattere. Non un assortimento, ma una linea di
        gusto.
      </PageIntro>

      <section className="shell pb-24">
        <div
          className="grid grid-cols-2 gap-px overflow-hidden md:grid-cols-3 lg:grid-cols-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}
        >
          {brands.map((b) => {
            const logo = mediaUrl(b.logo)
            return (
              <Link
                key={b.id}
                href={`/marchi/${b.slug}`}
                className="group flex aspect-[4/3] items-center justify-center bg-lino p-8 transition-colors hover:bg-lino-chiaro"
              >
                {logo ? (
                  <CloudinaryImage media={b.logo} alt={b.nome} aspect="3 / 2" sizes="280px" className="w-full" imgClassName="object-contain" />
                ) : (
                  <span className="font-display text-center text-2xl text-inchiostro transition-colors group-hover:text-loden">
                    {b.nome}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
