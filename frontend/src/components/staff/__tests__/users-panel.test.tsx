import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UsersPanel from '../UsersPanel'

afterEach(() => vi.restoreAllMocks())

describe('UsersPanel', () => {
  it('lists users and changes a role', async () => {
    const patch = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', vi.fn(async (_url: string, opts?: RequestInit) => {
      if (opts?.method === 'PATCH') return patch()
      return new Response(JSON.stringify([{ _id: 'u1', email: 'c@x.com', fullName: 'C', role: 'customer', country: 'IN', emailVerified: true }]), { status: 200 })
    }))
    render(<UsersPanel />)
    await waitFor(() => expect(screen.getByText(/c@x.com/)).toBeInTheDocument())
    await userEvent.selectOptions(screen.getByRole('combobox'), 'legal')
    expect(patch).toHaveBeenCalled()
  })
})
