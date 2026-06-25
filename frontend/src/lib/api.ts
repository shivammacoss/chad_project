export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error ?? res.statusText)
  }
  return data as T
}

export function apiGet<T>(path: string): Promise<T> {
  return fetch(path, { credentials: 'include' }).then(handle<T>)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).then(handle<T>)
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handle<T>)
}

export function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return fetch(path, { method: 'POST', credentials: 'include', body: form }).then(handle<T>)
}

export function apiDelete<T>(path: string): Promise<T> {
  return fetch(path, { method: 'DELETE', credentials: 'include' }).then(handle<T>)
}
