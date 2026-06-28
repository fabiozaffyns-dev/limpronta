import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductCard } from '@/components/ProductCard'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RichText } from '@/components/ui/RichText'
import { breadcrumbLd } from '@/lib/json-ld'
import { getBrandBySlug, getProductsByBrand } from '@/lib/queries'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Marchio non trovato' }
  return {
    title: brand.nome,
    description: `${brand.nome} da L'Impronta a Orbassano: capi selezionati e disponibili in negozio.`,
  }
}

export default async function BrandPage({ params }: Params) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const products = await getProductsByBrand(brand.id)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Marchi', path: '/marchi' },
              { name: brand.nome, path: `/marchi/${brand.slug}` },
            ]),
          ),
        }}
      />

      <header className="shell pt-36 pb-12 md:pt-44">
        <Eyebrow>
          <Link href="/marchi" className="link-segno">
            Marchi
          </Link>
        </Eyebrow>
        <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] leading-none">{brand.nome}</h1>
        {brand.descrizione && <RichText data={brand.descrizione} className="mt-8" />}
        {brand.sito && (
          <a
            href={brand.sito}
            target="_blank"
            rel="noopener noreferrer"
            className="cartellino link-segno mt-6 inline-block text-loden"
          >
            Sito ufficiale
          </a>
        )}
        <hr className="filetto mt-12" />
      </header>

      <section className="shell pb-24">
        {products.length === 0 ? (
          <p className="py-12 text-pietra-scura">
            Al momento non ci sono capi a catalogo per questo marchio. Scrivici per disponibilità e
            novità.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
