import { describe, it, expect, vi, afterEach } from 'vitest'
import { apiGet, apiPost, ApiError } from '../api'

afterEach(() => vi.restoreAllMocks())

function mockFetch(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

describe('api client', () => {
  it('returns parsed json on success', async () => {
    mockFetch(200, { ok: true })
    expect(await apiGet<{ ok: boolean }>('/api/health')).toEqual({ ok: true })
  })

  it('throws ApiError with server message on failure', async () => {
    mockFetch(401, { error: 'Not authenticated' })
    await expect(apiPost('/api/auth/me')).rejects.toMatchObject({
      status: 401,
      message: 'Not authenticated',
    })
    await expect(apiPost('/api/auth/me')).rejects.toBeInstanceOf(ApiError)
  })
})
