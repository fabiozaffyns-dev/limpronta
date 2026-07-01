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

/** Concatena ricorsivamente il testo dei nodi Lexical. */
function collectText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as { text?: unknown; children?: unknown[] }
  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(collectText).join('')
  return ''
}

/**
 * Estrae la prima frase (fino a . ? !) dal primo blocco di testo di uno stato
 * Lexical — usata per i blurb dei marchi. Ritorna '' se vuoto.
 */
export function firstSentence(data: unknown, max = 150): string {
  const root = (data as { root?: { children?: unknown[] } } | null | undefined)?.root
  if (!root?.children || !Array.isArray(root.children)) return ''
  for (const block of root.children) {
    const text = collectText(block).replace(/\s+/g, ' ').trim()
    if (!text) continue
    const match = text.match(/^(.*?[.?!])(\s|$)/)
    const sentence = match ? match[1] : text
    return sentence.length > max ? `${sentence.slice(0, max).trimEnd()}…` : sentence
  }
  return ''
}
