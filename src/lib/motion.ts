/**
 * Token condivisi del "motion language" L'Impronta — un solo ritmo, lette a
 * velocità diverse lungo lo scroll. Tieni qui easing/durate così tutti gli
 * effetti respirano allo stesso modo.
 */
export const EASE_EDITORIAL = 'expo.out'
export const EASE_SOFT = 'power3.out'
export const REVEAL_DUR = 1.1
export const STAGGER = 0.08

/** True se l'utente preferisce meno movimento (gate per ogni effetto JS). */
export const prefersReduced = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
