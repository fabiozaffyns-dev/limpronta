/**
 * Mini-builder per stati Lexical, usato da seed e import per generare contenuti
 * richtext via Local API senza passare dall'editor.
 */

type Block = { type: 'h2' | 'h3' | 'p'; text: string }

function textNode(text: string) {
  return { type: 'text', text, format: 0, mode: 'normal', style: '', detail: 0, version: 1 }
}

function node(block: Block) {
  const base = {
    children: [textNode(block.text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
  if (block.type === 'p') return { ...base, type: 'paragraph', textFormat: 0, textStyle: '' }
  return { ...base, type: 'heading', tag: block.type }
}

/** Costruisce un SerializedEditorState Lexical da una lista di blocchi semplici. */
export function buildLexical(blocks: Block[]) {
  return {
    root: {
      type: 'root',
      children: blocks.map(node),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

/** Helper rapido: una serie di paragrafi (eventuale "## " => h2). */
export function paragraphs(...parts: string[]) {
  return buildLexical(
    parts.map((t) =>
      t.startsWith('## ') ? { type: 'h2' as const, text: t.slice(3) } : { type: 'p' as const, text: t },
    ),
  )
}
