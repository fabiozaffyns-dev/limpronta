import type { Media } from '@/payload-types'

/** Coerce un campo relazione (id | doc) nel documento popolato, o null. */
export function rel<T extends object>(value: number | string | T | null | undefined): T | null {
  return value && typeof value === 'object' ? (value as T) : null
}

export type MediaLike = number | string | Media | null | undefined

export function mediaDoc(m: MediaLike): Media | null {
  return m && typeof m === 'object' ? (m as Media) : null
}

export function mediaUrl(m: MediaLike): string | null {
  return mediaDoc(m)?.url ?? null
}

export function mediaAlt(m: MediaLike, fallback = ''): string {
  return mediaDoc(m)?.alt ?? fallback
}

export function mediaDimensions(m: MediaLike): { width?: number | null; height?: number | null } {
  const doc = mediaDoc(m)
  return { width: doc?.width, height: doc?.height }
}
