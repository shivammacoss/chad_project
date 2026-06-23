import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import type { AuthUser } from '@/types/app'

interface AuthValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthCtx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setUser(await apiGet<AuthUser>('/api/auth/me'))
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  async function login(email: string, password: string) {
    const u = await apiPost<AuthUser>('/api/auth/login', { email, password })
    setUser(u)
    return u
  }

  async function logout() {
    await apiPost('/api/auth/logout')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
