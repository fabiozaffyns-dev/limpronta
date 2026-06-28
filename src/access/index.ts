import type { Access, FieldAccess } from 'payload'

/** Solo amministratori (collection-level). */
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

/** Amministratori o redattori (collection-level). */
export const isAdminOrEditor: Access = ({ req }) => {
  const role = req.user?.role
  return role === 'admin' || role === 'editor'
}

/** Solo amministratori (field-level). */
export const isAdminFieldLevel: FieldAccess = ({ req }) => req.user?.role === 'admin'

/** Lettura pubblica. */
export const anyone: Access = () => true

/**
 * Lettura pubblica solo dei documenti pubblicati; chi è loggato vede anche le bozze.
 * Da usare SOLO su collection con `versions.drafts` attivo.
 */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true
  return { _status: { equals: 'published' } }
}
