import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

afterEach(() => vi.restoreAllMocks())

function Probe() {
  const { user, loading } = useAuth()
  return <div>{loading ? 'loading' : (user?.email ?? 'anon')}</div>
}

describe('AuthProvider', () => {
  it('shows anon when /me is unauthorized', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401 })))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('anon')).toBeInTheDocument())
  })

  it('shows the user when /me succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'A', role: 'user' }), { status: 200 })),
    )
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByText('a@x.com')).toBeInTheDocument())
  })
})
