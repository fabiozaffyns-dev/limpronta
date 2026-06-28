// Loader custom per next/image.
// - Se l'URL è servito da Cloudinary, inietta trasformazioni responsive
//   (f_auto, q_auto, c_limit, w_{width}) delegando ottimizzazione e formato alla CDN.
// - Per qualsiasi altro URL (storage su disco in dev, asset locali) restituisce
//   il src invariato → graceful fallback senza Cloudinary configurato.

type LoaderArgs = { src: string; width: number; quality?: number }

const UPLOAD_MARKER = '/upload/'

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  const isCloudinary = src.includes('res.cloudinary.com')
  const markerIndex = src.indexOf(UPLOAD_MARKER)

  if (!isCloudinary || markerIndex === -1) {
    return src
  }

  const q = quality ? String(quality) : 'auto'
  const transforms = `f_auto,q_${q},c_limit,w_${width}`
  const head = src.slice(0, markerIndex + UPLOAD_MARKER.length)
  const tail = src.slice(markerIndex + UPLOAD_MARKER.length)

  // Evita doppia iniezione se l'URL contiene già le nostre trasformazioni.
  if (tail.startsWith(transforms)) return src

  return `${head}${transforms}/${tail}`
}
