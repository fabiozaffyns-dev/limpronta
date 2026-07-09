import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'
import { safeHref } from '@/lib/sanitize'

type LexicalData = ComponentProps<typeof LexicalRichText>['data']
type Converters = ComponentProps<typeof LexicalRichText>['converters']

/**
 * Render dei contenuti Lexical con la tipografia editoriale del sito.
 * I link passano per safeHref: un editor non può iniettare href javascript:/data:
 * in uscita (difesa a valle della validazione in ingresso di Payload).
 */
const converters: Converters = ({ defaultConverters }) => ({
  ...defaultConverters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  link: ({ node, nodesToJSX }: any) => {
    const children = nodesToJSX({ nodes: node.children })
    const url = safeHref(node.fields?.url)
    if (!url) return <span>{children}</span>
    const newTab = Boolean(node.fields?.newTab)
    return (
      <a href={url} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  },
})

export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data) return null
  return (
    <div className={cn('prose-impronta', className)}>
      <LexicalRichText data={data as LexicalData} converters={converters} />
    </div>
  )
}
