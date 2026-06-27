import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from '../Navbar'
import { AuthProvider } from '@/store/AuthContext'

afterEach(() => vi.restoreAllMocks())

function Where() {
  const loc = useLocation()
  return <div data-testid="path">{loc.pathname}</div>
}

function renderNav(role: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/api/auth/me'))
        return new Response(JSON.stringify({ id: '1', email: 'a@x.com', fullName: 'Jo', role }), { status: 200 })
      return new Response('{}', { status: 200 })
    }),
  )
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="*" element={<Where />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Navbar auth links', () => {
  it('sends an admin to the real console (/staff), never the old /admin or customer dashboard', async () => {
    renderNav('admin')
    const btn = (await screen.findAllByRole('button', { name: /console/i }))[0]
    await userEvent.click(btn)
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/staff'))
    // No customer "Dashboard" link and no old "Admin" link for staff.
    expect(screen.queryAllByRole('button', { name: 'Dashboard' })).toHaveLength(0)
    expect(screen.queryAllByRole('button', { name: 'Admin' })).toHaveLength(0)
  })

  it('sends a non-admin staff member (e.g. legal) to the console too', async () => {
    renderNav('legal')
    const btn = (await screen.findAllByRole('button', { name: /console/i }))[0]
    await userEvent.click(btn)
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/staff'))
  })

  it('sends a customer to their dashboard', async () => {
    renderNav('user')
    const btn = (await screen.findAllByRole('button', { name: /dashboard/i }))[0]
    await userEvent.click(btn)
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/dashboard'))
  })
})
