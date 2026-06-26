// CLIENT_URL may be a single URL or a comma-separated list (e.g. production + a
// custom domain). Trailing slashes and whitespace are stripped so CORS origin
// comparison (which is exact) doesn't fail on a stray "/".

export function clientUrlList(): string[] {
  return (process.env.CLIENT_URL ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

/** The canonical client origin (first entry) — used for redirect/email links. */
export function primaryClientUrl(): string {
  return clientUrlList()[0] ?? 'http://localhost:5173'
}

/** True if the request Origin is allowed to call the API (CORS). */
export function isAllowedOrigin(origin: string): boolean {
  const clean = origin.replace(/\/+$/, '')
  if (clientUrlList().includes(clean)) return true
  // Optionally allow Vercel preview deployments (set ALLOW_VERCEL_PREVIEWS=true).
  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true') {
    try {
      if (new URL(origin).hostname.endsWith('.vercel.app')) return true
    } catch {
      // ignore malformed origin
    }
  }
  return false
}
