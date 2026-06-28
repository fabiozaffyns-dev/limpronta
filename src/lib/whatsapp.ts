/** Deep-link WhatsApp con messaggio precompilato. */

const FALLBACK_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

export function buildWhatsAppLink(opts: { number?: string | null; message: string }): string {
  const num = (opts.number || FALLBACK_NUMBER).replace(/[^0-9]/g, '')
  const text = encodeURIComponent(opts.message)
  return `https://wa.me/${num}?text=${text}`
}

/** Messaggio standard di richiesta disponibilità per un prodotto. */
export function productInquiryMessage(p: { nome: string; sku: string }): string {
  return `Buongiorno, vorrei informazioni su "${p.nome}" (rif. ${p.sku}). È disponibile in negozio?`
}

/** Messaggio generico (CTA "Prenota in negozio"). */
export function appointmentMessage(): string {
  return "Buongiorno, vorrei fissare un appuntamento da L'Impronta."
}
