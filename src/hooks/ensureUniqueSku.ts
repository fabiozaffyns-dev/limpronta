import type { TextFieldSingleValidation } from 'payload'

/**
 * Validazione SKU con messaggio in italiano.
 * L'indice DB `unique` resta la garanzia "hard"; questo dà l'errore leggibile
 * e protegge l'upsert dello script di import (esclude il documento stesso via id).
 */
export const ensureUniqueSku: TextFieldSingleValidation = async (value, { req, id }) => {
  if (!value || value.trim().length === 0) return 'Lo SKU è obbligatorio.'

  const result = await req.payload.find({
    collection: 'products',
    where: { sku: { equals: value } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  const clash = result.docs.find((doc) => doc.id !== id)
  if (clash) {
    const nome = (clash as { nome?: string }).nome ?? clash.id
    return `SKU "${value}" già usato dal prodotto "${nome}".`
  }

  return true
}
