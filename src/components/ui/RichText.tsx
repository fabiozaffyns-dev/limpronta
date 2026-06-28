import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

type LexicalData = ComponentProps<typeof LexicalRichText>['data']

/** Render dei contenuti Lexical con la tipografia editoriale del sito. */
export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data) return null
  return (
    <div className={cn('prose-impronta', className)}>
      <LexicalRichText data={data as LexicalData} />
    </div>
  )
}
