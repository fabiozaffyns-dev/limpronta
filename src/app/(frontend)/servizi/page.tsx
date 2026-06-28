import type { Metadata } from 'next'

import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PageIntro } from '@/components/ui/PageIntro'
import { RichText } from '@/components/ui/RichText'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { getServices, getSettings } from '@/lib/queries'
import { appointmentMessage } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Servizi',
  description:
    "I servizi de L'Impronta a Orbassano: consulenza d'immagine, personal shopping e capi su misura. Su appuntamento.",
}

export default async function ServiziPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()])

  return (
    <>
      <PageIntro eyebrow="Su appuntamento" titolo="Servizi">
        Vestire bene è un fatto di tempo e di ascolto. Mettiamo a disposizione esperienza e relazioni
        per costruire il tuo modo di presentarti.
      </PageIntro>

      <section className="shell pb-8">
        <div className="grid gap-px overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--color-pietra) 30%, transparent)' }}>
          {services.length === 0 ? (
            <div className="bg-lino p-10">
              <p className="text-pietra-scura">
                I servizi saranno descritti a breve. Nel frattempo, scrivici per qualsiasi esigenza.
              </p>
            </div>
          ) : (
            services.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 80} className="bg-lino">
                <div className="grid items-start gap-6 p-8 md:grid-cols-[auto_1fr] md:gap-10 md:p-12">
                  <div className="flex h-16 w-16 items-center justify-center border" style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 45%, transparent)' }}>
                    <ServiceIcon name={s.icona} />
                  </div>
                  <div>
                    <h2 className="text-3xl">{s.titolo}</h2>
                    {s.descrizione && <RichText data={s.descrizione} className="mt-4" />}
                  </div>
                </div>
              </Reveal>
            ))
          )}
        </div>
      </section>

      <section className="shell pb-12">
        <div className="flex flex-col items-start gap-6 border p-10 md:flex-row md:items-center md:justify-between md:p-14" style={{ borderColor: 'color-mix(in srgb, var(--color-ottone) 40%, transparent)' }}>
          <div>
            <Eyebrow>Prenota</Eyebrow>
            <p className="mt-4 font-display text-3xl md:text-4xl">Fissiamo un appuntamento.</p>
          </div>
          <WhatsAppButton number={settings.whatsappNumber} message={appointmentMessage()} label="Scrivici su WhatsApp" />
        </div>
      </section>
    </>
  )
}
