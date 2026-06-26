export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Backend base URL. Empty by default → relative paths (Vite dev proxy / Vercel rewrite).
// Set VITE_API_URL to the backend origin (e.g. https://chad-backend.onrender.com) to call it directly.
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Build a full URL for a backend path (for <a href> downloads / external links). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText)
  }
  return data as T
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(apiUrl(path), { credentials: 'include' }).then(handle<T>)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(handle<T>)
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return fetch(apiUrl(path), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle<T>)
}

export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return fetch(apiUrl(path), { method: 'POST', credentials: 'include', body: form }).then(handle<T>)
}

export function apiDelete<T>(path: string): Promise<T> {
  return fetch(apiUrl(path), { method: 'DELETE', credentials: 'include' }).then(handle<T>)
}
