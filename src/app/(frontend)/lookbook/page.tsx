import type { Metadata } from 'next'
import Link from 'next/link'

import { CloudinaryImage } from '@/components/ui/CloudinaryImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageIntro } from '@/components/ui/PageIntro'
import { formatStagioneEstesa } from '@/lib/format'
import { getLookbooks } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Lookbook',
  description:
    "I lookbook stagionali de L'Impronta: accostamenti, materiali e dettagli dell'uomo contemporaneo.",
}

export default async function LookbookIndexPage() {
  const lookbooks = await getLookbooks()

  return (
    <>
      <PageIntro eyebrow="Editoriale" titolo="Lookbook">
        Racconti di stagione. Il modo in cui un capo dialoga con gli altri: ecco il nostro punto di
        vista.
      </PageIntro>

      <section className="shell pb-24">
        {lookbooks.length === 0 ? (
          <p className="py-12 text-pietra-scura">I lookbook stagionali arriveranno presto.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {lookbooks.map((lb) => {
              const cover = lb.immagini?.[0]
              const stagione = formatStagioneEstesa(lb.stagione)
              return (
                <Link key={lb.id} href={`/lookbook/${lb.slug}`} className="group block">
                  <div className="overflow-hidden">
                    <CloudinaryImage
                      media={cover}
                      alt={lb.titolo}
                      aspect="4 / 5"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-5">
                    {stagione && <Eyebrow>{stagione}</Eyebrow>}
                    <h2 className="mt-2 text-3xl transition-colors group-hover:text-loden">{lb.titolo}</h2>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
