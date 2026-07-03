'use client'

/**
 * Error boundary del sito pubblico: accoglie l'utente se una pagina non si
 * carica (es. database freddo o momentaneamente irraggiungibile) invece
 * dell'errore generico di Next. Volutamente senza dipendenze da Settings
 * (se il DB è giù, anche quelle fallirebbero): recapiti hardcoded di riserva.
 */
export default function ErrorePagina({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[70svh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="cartellino text-ottone-testo">Un attimo di pazienza</p>
      <h1 className="font-display mt-4 max-w-xl text-3xl text-inchiostro sm:text-4xl">
        Qualcosa non ha risposto come doveva.
      </h1>
      <p className="mt-4 max-w-md text-pietra-scura">
        Riprova tra qualche istante: di solito basta. Se il problema persiste, il negozio è sempre
        raggiungibile al telefono.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button type="button" onClick={reset} className="btn btn-primario">
          Riprova
        </button>
        <a href="tel:+390116206975" className="cartellino link-segno text-ottone-testo">
          011 6206975
        </a>
      </div>
    </div>
  )
}
