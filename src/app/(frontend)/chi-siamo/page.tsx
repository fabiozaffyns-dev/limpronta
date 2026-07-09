import type { Metadata } from 'next'
import Link from 'next/link'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { EditorialFigure } from '@/components/ui/EditorialFigure'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CredoReveal } from '@/components/motion/CredoReveal'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { PageIntro } from '@/components/ui/PageIntro'
import { SwapLabel } from '@/components/ui/SwapLabel'
import { Reveal } from '@/components/motion/Reveal'
import { getSettings } from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Chi siamo',
  description:
    "L'Impronta: abbigliamento uomo a Orbassano dal 2014. La materia e il segno — pochi marchi scelti, qualità vera e consiglio sartoriale.",
  alternates: { canonical: '/chi-siamo' },
}

const VALORI = [
  {
    t: 'La selezione',
    d: 'Pochi marchi, scelti per coerenza e qualità. Niente muri di capi: solo ciò in cui crediamo davvero.',
  },
  {
    t: 'La materia',
    d: 'Tessuti veri, costruzioni oneste, dettagli che si notano da vicino. La sostanza viene prima del rumore.',
  },
  {
    t: 'La persona',
    d: 'Ti ascoltiamo e ti consigliamo come faremmo con un amico. Su misura, anche quando non è su misura.',
  },
]

export default async function ChiSiamoPage() {
  const settings = await getSettings()
  const via = [settings.indirizzo?.via, settings.indirizzo?.civico].filter(Boolean).join(' ')

  return (
    <>
      <PageIntro eyebrow="Dal 2014" titolo="Chi siamo">
        Un negozio di abbigliamento uomo a Orbassano, costruito su un&apos;idea semplice: poche
        cose, scelte bene. Perché vestire con cura è una forma di rispetto — e lascia un segno.
      </PageIntro>

      {/* ─── Storia ───────────────────────────────────────────────────────── */}
      <section className="shell grid items-center gap-12 pb-24 lg:grid-cols-2 lg:gap-20">
        <MaskReveal>
          <EditorialFigure
            media={settings.chiSiamoFoto1}
            alt="L'Impronta — la nostra storia"
            aspect="4 / 5"
            label="Orbassano · dal 2014"
            parallax
          />
        </MaskReveal>
        <Reveal delay={120}>
          <Eyebrow>La nostra storia</Eyebrow>
          <SplitLines as="h2" className="mt-4 text-3xl md:text-4xl">
            Nata da una passione, cresciuta con misura.
          </SplitLines>
          <div className="mt-6 space-y-5 text-lg text-pietra-scura">
            <p>
              Abbiamo aperto nel 2014 con un&apos;ambizione precisa: portare a Orbassano un
              guardaroba maschile fatto di marchi veri, tessuti che durano e tagli che non passano di
              moda.
            </p>
            <p>
              Non inseguiamo le mode: le filtriamo. Ogni stagione scegliamo pochi capi, uno a uno, da
              brand che condividono la nostra stessa idea di cura. Quello che trovi in negozio è già
              una selezione.
            </p>
            <p>
              Crediamo che il consiglio giusto nasca solo di persona — guardando la materia, provando
              il capo, prendendosi il tempo. Per questo il nostro mestiere si fa qui, in negozio.
            </p>
          </div>
          {/* La firma del titolare: una boutique che vende relazione e consiglio
             ha un nome e un volto. La foto la carica Fabio in un secondo momento. */}
          <p className="font-display mt-8 text-2xl text-ottone-testo">Fabio Zaffino</p>
          <p className="cartellino mt-1 text-pietra-scura">Titolare · L&rsquo;Impronta</p>
        </Reveal>
      </section>

      {/* ─── Manifesto ────────────────────────────────────────────────────── */}
      <section className="bg-inchiostro text-avorio">
        <div className="shell py-28 text-center md:py-36">
          <Reveal>
            <Eyebrow scuro>La nostra idea</Eyebrow>
            <CredoReveal className="mx-auto mt-8 max-w-3xl font-display text-3xl leading-[1.2] text-avorio md:text-[2.7rem]">
              Un capo è fatto di <span className="italic text-ottone-chiaro">materia</span> — lana,
              cotone, mani che cuciono.
              <br />E lascia un <span className="italic text-ottone-chiaro">segno</span>: il modo in
              cui ti fa stare al mondo.
            </CredoReveal>
          </Reveal>
        </div>
      </section>

      {/* ─── Valori ───────────────────────────────────────────────────────── */}
      <section className="shell py-24">
        <Reveal>
          <Eyebrow>Come lavoriamo</Eyebrow>
          <SplitLines as="h2" className="mt-4 max-w-2xl text-3xl md:text-4xl">
            Tre cose a cui non rinunciamo.
          </SplitLines>
        </Reveal>
        <div className="mt-14 grid gap-12 md:grid-cols-3">
          {VALORI.map((v, i) => (
            <Reveal key={v.t} delay={(i % 3) * 80}>
              <span
                aria-hidden
                className="block h-px w-12"
                style={{ backgroundColor: 'var(--color-ottone)' }}
              />
              <h3 className="mt-5 font-display text-2xl">{v.t}</h3>
              <p className="mt-3 text-pietra-scura">{v.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── Il negozio + CTA ─────────────────────────────────────────────── */}
      <section className="shell grid items-center gap-12 pb-28 lg:grid-cols-[0.55fr_0.45fr] lg:gap-20">
        <MaskReveal className="lg:order-2">
          <EditorialFigure
            media={settings.chiSiamoFoto2}
            alt="Dentro L'Impronta — il negozio a Orbassano"
            aspect="3 / 4"
            label="Il negozio"
            sizes="(max-width: 1024px) 100vw, 45vw"
            parallax
          />
        </MaskReveal>
        <Reveal delay={120} className="lg:order-1">
          <Eyebrow>Vieni a trovarci</Eyebrow>
          <SplitLines as="h2" className="mt-4 text-3xl md:text-4xl">
            Ti aspettiamo a Orbassano.
          </SplitLines>
          <p className="mt-6 text-lg text-pietra-scura">
            {via ? `In ${via}, ` : ''}nel cuore di Orbassano: uno spazio dove prendersi il tempo di
            guardare, toccare e capire. Passa quando vuoi, o prenota un momento dedicato.
          </p>
          <p className="mt-5 text-lg text-pietra-scura">
            Dentro trovi la nostra selezione disposta come piace a noi — poca roba, scelta bene:
            capispalla, maglieria, camicie, denim e calzature delle firme che seguiamo da anni. E
            trovi soprattutto qualcuno che ti ascolta: raccontaci l&rsquo;occasione, al resto pensiamo
            insieme.
          </p>
          <p className="mt-5 text-lg text-pietra-scura">
            Se preferisci la tranquillità assoluta, fissa un momento tutto tuo: un caffè, qualche
            capo scelto per te, nessuna fretta.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <WhatsAppButton
              number={settings.whatsappNumber}
              message={appointmentMessage()}
              label="Prenota una visita"
              className="w-full justify-center sm:w-auto"
            />
            <Link href="/contatti" className="btn btn-ghost w-full justify-center sm:w-auto">
              <SwapLabel>Dove siamo</SwapLabel>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
