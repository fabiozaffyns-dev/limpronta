/**
 * Skeleton del catalogo: la rotta è dinamica (filtri via searchParams) e la
 * prima query può pagare il cold start del database — meglio una griglia in
 * attesa che una pagina bianca.
 * NB: lo skeleton fa da fallback ANCHE per /catalogo/[slug]; niente <h1> qui,
 * altrimenti nell'HTML iniziale della scheda prodotto ci sarebbero due h1.
 */
export default function CatalogoLoading() {
  return (
    <>
      <header className="shell pt-36 pb-12 md:pt-44">
        <p className="cartellino text-ottone-testo">Collezione</p>
        <p className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">Catalogo</p>
        <p className="cartellino mt-6 text-pietra-scura" role="status">
          Prepariamo il catalogo…
        </p>
        <hr className="filetto mt-12" />
      </header>
      <section className="shell pb-24" aria-hidden>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] animate-pulse bg-pietra/15" />
              <div className="mt-4 h-3 w-1/3 animate-pulse bg-pietra/15" />
              <div className="mt-2 h-4 w-2/3 animate-pulse bg-pietra/15" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
