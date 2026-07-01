import type { Metadata } from 'next'

import { IndiceMarchi } from '@/components/motion/IndiceMarchi'
import { PageIntro } from '@/components/ui/PageIntro'
import { getBrandsIndex } from '@/lib/queries'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Marchi',
  description:
    "I marchi selezionati da L'Impronta: sartoria italiana e firme contemporanee per l'uomo, scelte una a una.",
}

export default async function MarchiPage() {
  const items = await getBrandsIndex()
  const totPezzi = items.reduce((sum, b) => sum + b.count, 0)

  return (
    <>
      <PageIntro eyebrow="Le firme" titolo="La curatela">
        Non un assortimento, ma una linea di gusto. Ogni firma è scelta per coerenza, qualità e
        carattere — passa un nome e affiora la sua materia.
      </PageIntro>

      <section className="shell pb-24">
        {items.length === 0 ? (
          <p className="py-12 text-pietra-scura">
            I nostri marchi saranno presto online. Intanto, passa a trovarci in negozio.
          </p>
        ) : (
          <>
            <IndiceMarchi items={items} />
            <p className="cartellino mt-16 text-pietra-scura">
              Selezione L&rsquo;Impronta · Orbassano — {items.length} firme
              {totPezzi > 0 ? `, ${totPezzi} pezzi in negozio` : ''}
            </p>
          </>
        )}
      </section>
    </>
  )
}
