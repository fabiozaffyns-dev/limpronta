import type { ReactNode } from 'react'

import { Eyebrow } from '@/components/ui/Eyebrow'
import { SplitLines } from '@/components/motion/SplitLines'

/** Intestazione editoriale coerente per le pagine interne. */
export function PageIntro({
  eyebrow,
  titolo,
  children,
}: {
  eyebrow?: string
  titolo: string
  children?: ReactNode
}) {
  return (
    <header className="shell pt-36 pb-12 md:pt-44">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SplitLines as="h1" className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05]">
        {titolo}
      </SplitLines>
      {children && <div className="mt-6 max-w-2xl text-lg text-pietra-scura">{children}</div>}
      <hr className="filetto mt-12" />
    </header>
  )
}
