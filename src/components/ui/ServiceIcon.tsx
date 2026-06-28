type IconKey = 'forbici' | 'metro' | 'occhio' | 'borsa' | 'gancio' | 'sigillo'

const PATHS: Record<IconKey, React.ReactNode> = {
  forbici: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M8 7.5 20 18M8 16.5 20 6" />
    </>
  ),
  metro: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </>
  ),
  occhio: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  borsa: (
    <>
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  gancio: (
    <>
      <path d="M12 3a2 2 0 0 0-1 3.7c.6.4 1 .9 1 1.6" />
      <path d="M12 8 3.5 15.5a1 1 0 0 0 .6 1.8h15.8a1 1 0 0 0 .6-1.8L12 8Z" />
    </>
  ),
  sigillo: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M9 9.5h4.5a2 2 0 0 1 0 4H9" />
    </>
  ),
}

export function ServiceIcon({ name, size = 34 }: { name?: string | null; size?: number }) {
  const key = (name && name in PATHS ? name : 'sigillo') as IconKey
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      style={{ color: 'var(--color-ottone)' }}
    >
      {PATHS[key]}
    </svg>
  )
}
